const fs = require('fs')
const path = require('path')
const glob = require('glob-promise')
const knex = require('knex')
const envInit = require('./env-init')

let client

up()

async function up (env = 'dev') {
  envInit(env)

  console.warn('Starting migrations!')

  const stringsToReplace = [
    'POSTGRESQL_DATABASE',
    'POSTGRESQL_ROLE_PERSON',
    'POSTGRESQL_ROLE_ANONYMOUS',
    'POSTGRESQL_ROLE_POSTGRAPHILE',
    'POSTGRESQL_ROLE_POSTGRAPHILE_PASSWORD'
  ].reduce((obj, envVar) => {
    obj[envVar] = process.env[envVar] || envVar
    if (obj[envVar] !== envVar) {
      console.warn(`  * Will replace $${envVar} with environment value!`)
    }
    return obj
  }, {})

  async function waitForDB () {
    let attemptsCount = 0
    return new Promise(async (resolve) => {
      const wait = setInterval(waiting, 5000)

      async function waiting () {
        if (attemptsCount === 1) {
          console.warn('* Waiting ~30s for postgres to start')
        }
        attemptsCount += 1
        try {
          await testConnection()
          clearInterval(wait)
          console.warn('* Database is up and running')
          resolve()
        }
        catch (err) {
          if (err.message.includes('starting')) {
            console.warn('    * … database is starting up')
          }
          else if (attemptsCount > 7) {
            console.warn(`  * Err: ${err.message}`)
            console.warn('    * … waiting 5s before retrying')
          }
        }
      }
    })
  }

  await waitForDB()
  await createDatabase()
  await run(stringsToReplace)

  if (client) {
    await client.destroy()
  }
  process.exit(0)
}

async function run (stringsToReplace) {
  setupClient()

  const files = await glob(`${__dirname}/sql/*.sql`)

  try {
    await client.schema.createTable('__migrations', (table) => {
      table.increments().primary()
      table.string('filename').notNullable()
      table.unique('filename')
      table.boolean('succeeded').defaultTo(false)
      table.timestamps()
    })
    console.warn('* Created migrations table!')
  }
  catch (err) {
    console.warn('* Found migrations table!')
  }

  for (const file of files) {
    const filename = path.basename(file)
    const done = await client.select('succeeded').from('__migrations').where({ filename })

    if (!done.length) {
      await client('__migrations').insert({ filename })
    }
    if (!done.length || !done[0].succeeded) {
      console.warn('  *', filename, 'running')
      await execute(file, stringsToReplace)
    }
    else {
      console.warn('  *', filename, 'already applied')
    }
  }
  console.warn('* Migration is done!')
  return client.destroy()
}

async function execute (file, stringsToReplace) {
  const filename = path.basename(file)

  let sql = fs.readFileSync(file).toString()

  Object.entries(stringsToReplace).forEach(([key, value]) => {
    sql = sql.replace(new RegExp(`\\$${key}`, 'g'), `${value}`)
  })

  if (filename.includes('.no-transaction')) {
    await client.raw(sql)
    await client('__migrations')
      .where({ filename })
      .update({ succeeded: true })
    return Promise.resolve()
  }

  return client.transaction(async (trx) => {
    await trx.raw(sql)
    await trx('__migrations')
      .where({ filename })
      .update({ succeeded: true })
    return Promise.resolve()
  })
}

async function testConnection () {
  const client = knex({
    client: 'pg',
    connection: {
      user: 'postgres',
      host: process.env.POSTGRESQL_HOST || 'localhost',
      database: 'postgres',
      password: process.env.POSTGRESQL_PASSWORD
    }
  })

  // if this doesn't throw, we're connected!
  await client.select(client.raw('1'))
}

async function createDatabase () {
  try {
    const client = knex({
      client: 'pg',
      connection: {
        user: 'postgres',
        host: process.env.POSTGRESQL_HOST || 'localhost',
        database: 'postgres',
        password: process.env.POSTGRESQL_PASSWORD
      }
    })

    // if this doesn't throw, we're connected!
    await client.select(client.raw('1'))

    await client.raw(`create database ${process.env.POSTGRESQL_DATABASE}`)
    // await client.raw(`create user ${process.env.POSTGRESQL_ROLE_POSTGRAPHILE} with encrypted password '${process.env.POSTGRESQL_ROLE_POSTGRAPHILE_PASSWORD}'`)
    await client.raw(`create role ${process.env.POSTGRESQL_ROLE_POSTGRAPHILE} login password '${process.env.POSTGRESQL_ROLE_POSTGRAPHILE_PASSWORD}'`)
    await client.raw(`grant all privileges on database ${process.env.POSTGRESQL_DATABASE} to ${process.env.POSTGRESQL_ROLE_POSTGRAPHILE}`)

    console.warn(`* Created database '${process.env.POSTGRESQL_DATABASE}' and role ${process.env.POSTGRESQL_ROLE_POSTGRAPHILE}`)
    client.destroy()
  }
  catch (err) {
    if (/database "[\w_]+" already exists/.test(err.message)) {
      console.warn(`* ${err.message}`)
      return
    }
    throw err
  }
  if (client) {
    await client.destroy()
  }
}

function setupClient () {
  client = knex({
    client: 'pg',
    connection: {
      user: 'postgres',
      host: process.env.POSTGRESQL_HOST || 'localhost',
      database: process.env.POSTGRESQL_DATABASE,
      password: process.env.POSTGRESQL_PASSWORD
    }
  })

  return client
}
