const fs = require('fs')
const path = require('path')
const glob = require('glob-promise')
const knex = require('knex')
const ora = require('ora')
const getConfigFromEnvVars = require('./migration-helpers').getConfigFromEnvVars

const envInit = require('./env-init')

let client

(async function up () {
  envInit()

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
      ora(`Replaced with env value: $${envVar}`).info()
    }
    return obj
  }, {})

  async function waitForDB () {
    let attemptsCount = 0
    const spinner = ora('Waiting for postgres to start').start()
    return new Promise(async (resolve) => {
      const wait = setInterval(waiting, 5000)

      async function waiting () {
        attemptsCount += 1
        try {
          await testConnection()
          clearInterval(wait)
          spinner.succeed('Database is up and running')
          resolve()
        }
        catch (err) {
          if (err.message.includes('starting')) {
            spinner.text = 'Database is starting up'
          }
          else if (attemptsCount > 30) {
            spinner.fail(err.message)
          }
          else {
            spinner.text = 'Waiting 5s before retrying'
          }
        }
      }
    })
  }

  await waitForDB()
  await dropTestDatabase()
  await createDatabase()
  await run(stringsToReplace)
  await migrateSettings()

  if (client) {
    await client.destroy()
  }
  process.exit(0)
})()

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
    ora('Created migrations table!').succeed()
  }
  catch (err) {
    ora('Found migrations table!').info()
  }

  for (const file of files) {
    const filename = path.basename(file)
    const done = await client.select('succeeded').from('__migrations').where({ filename })

    if (!done.length) {
      await client('__migrations').insert({ filename })
    }
    const spinner = ora(`Running: ${filename}`)
    try {
      if (!done.length || !done[0].succeeded) {
        spinner.start()
        await execute(file, stringsToReplace)
        spinner.succeed(`Applied: ${filename}`)
      }
      else {
        spinner.info(`Already applied: ${filename}`)
      }
    }
    catch (err) {
      spinner.fail()
      await client.destroy()
      console.error(err)
      process.exit(1)
    }
  }
  ora('Migration is done!').succeed()
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

async function dropTestDatabase () {
  if (!process.env.NODE_TEST) {
    return
  }
  const spinner = ora('Dropping test database').start()
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

    await client.raw(`drop database ${process.env.POSTGRESQL_DATABASE}`) // drop database example_com_db;
    await client.raw(`drop role ${process.env.POSTGRESQL_ROLE_POSTGRAPHILE}`)  // drop role example_com_role_postgraphile;
    await client.raw(`drop role ${process.env.POSTGRESQL_ROLE_ANONYMOUS}`) // drop role example_com_role_anonymous;
    await client.raw(`drop role ${process.env.POSTGRESQL_ROLE_PERSON}`) // drop role example_com_role_person;

    spinner.succeed(`Dropped test database '${process.env.POSTGRESQL_DATABASE}' and its roles`)
    client.destroy()
  }
  catch (err) {
    if (err.message.endsWith('does not exist')) {
      spinner.info(err.message)
      return
    }
    throw err
  }
  if (client) {
    await client.destroy()
  }
}

async function createDatabase () {
  const spinner = ora('Setting up database and roles').start()
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

    spinner.succeed(`Created database '${process.env.POSTGRESQL_DATABASE}' and role ${process.env.POSTGRESQL_ROLE_POSTGRAPHILE}`)
    await client.destroy()
  }
  catch (err) {
    if (/database "[\w_]+" already exists/.test(err.message)) {
      spinner.info(err.message)
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
}

// temp
async function migrateSettings () {
  const spinner = ora('Migrating settings from env vars to DB').start()

  const importableEnvVars = [
    'EDITOR_CONFIG',
    'AUTH_STRATEGY',
    'EDITOR_HOST',
    'EDITOR_PROTOCOL',
    'OAUTH_CLIENT_ID',
    'DATASET_BASE_URL',
    'CLASS_BASE_URL',
    'PROPERTY_BASE_URL',
    'CONTAINERS_NESTING_PREDICATE',
    'ONTOLOGY_RAW_URL',
    'STRUCTURE_RAW_URL',
    'OAUTH_HOST',
    'OAUTH_CLIENT_SECRET',
    'GITHUB_PERSONAL_ACCESS_TOKEN'
  ]

  try {
    const client = knex({
      client: 'pg',
      connection: {
        host: process.env.POSTGRESQL_HOST || 'localhost',
        database: process.env.POSTGRESQL_DATABASE,
        user: 'postgres',
        password: process.env.POSTGRESQL_PASSWORD
      }
    })

    const existingConfigs = await client
      .withSchema('editor_schema')
      .select('id', 'forge', 'editor', 'ontology')
      .from('config')
      .orderBy('id', 'desc')
      .limit(1)

    if (!existingConfigs.length) {
      const { forge, editor, ontology } = getConfigFromEnvVars()

      const varsToImport = importableEnvVars.filter(name => !!process.env[name])
      if (!varsToImport.length) {
        spinner.succeed('No environment variable to import')
        return
      }
      else {
        spinner.info(`Will import the following env vars: \n  - ${varsToImport.map(x => `${x}=${process.env[x]}`).join('\n  - ')}\n`)
      }

      await client.raw(`
        INSERT INTO
          "editor_schema"."config"("forge", "editor", "ontology", "reason")
        VALUES(
          '${JSON.stringify(forge)}'::jsonb,
          '${JSON.stringify(editor)}'::jsonb,
          '${JSON.stringify(ontology)}'::jsonb,
          'Initial config imported from env vars'
        )
        RETURNING "id", "forge", "editor", "ontology";
      `)
      spinner.succeed('Imported config from env vars')
    }
    else {
      spinner.succeed('Config exists; not importing anything.')
    }

    await client.destroy()
  }
  catch (err) {
    throw err
  }
  if (client) {
    await client.destroy()
  }
}
