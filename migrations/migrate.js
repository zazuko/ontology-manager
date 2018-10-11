const fs = require('fs')
const path = require('path')
const glob = require('glob-promise')
const knex = require('knex')
const dotenv = require('dotenv')

const environments = {
  dev: `${__dirname}/../docker-app-dev/.env`,
  test: `${__dirname}/test/.env`
}

async function up (env = 'dev') {
  if (!environments.hasOwnProperty(env)) {
    throw new Error('env arg missing')
  }

  // load env vars
  dotenv.config({ path: environments[env] })

  console.warn('Starting migrations!')

  const stringsToReplace = [
    'POSTGRESQL_POSTGRAPHILE_PASSWORD'
  ].reduce((obj, envVar) => {
    obj[envVar] = process.env[envVar] || envVar
    if (obj[envVar] !== envVar) {
      console.warn(`  * Will replace $${envVar} with environment value!`)
    }
    return obj
  }, {})

  await run(stringsToReplace)
}

async function run (stringsToReplace) {
  const client = knex({
    client: 'pg',
    connection: {
      user: 'postgres',
      host: process.env.POSTGRESQL_HOST || 'localhost',
      database: process.env.POSTGRESQL_DATABASE,
      password: process.env.POSTGRESQL_PASSWORD
    }
  })

  const files = await glob(`${__dirname}/sql/*.sql`)

  try {
    await client.schema.createTable('__migrations', (table) => {
      table.increments().primary()
      table.string('filename').notNullable()
      table.unique('filename')
      table.boolean('succeeded').defaultTo(false)
      table.timestamps()
    })
    console.warn('  * Created migrations table!')
  } catch (err) {
    console.warn('  * Found migrations table!')
  }

  try {
    for (const file of files) {
      const filename = path.basename(file)
      const done = await client.select('succeeded').from('__migrations').where({ filename })

      if (!done.length) {
        await client('__migrations').insert({ filename })
      }
      if (!done.length || !done[0].succeeded) {
        console.warn('    *', filename, 'running')
        await execute(file, client, stringsToReplace)
      } else {
        console.warn('    *', filename, 'already applied')
      }
    }
  } catch (err) {
    console.error(err)
    client.destroy()
    process.exit(1)
  }
  client.destroy()
}

async function execute (file, client, stringsToReplace) {
  const filename = path.basename(file)
  return client.transaction(async (trx) => {
    let sql = fs.readFileSync(file).toString()

    Object.entries(stringsToReplace).forEach(([key, value]) => {
      sql = sql.replace(new RegExp(`\\$${key}`, 'g'), `${value}`)
    })

    await trx.raw(sql)
    return trx('__migrations')
      .where({ filename })
      .update({ succeeded: true })
  })
}

up()
