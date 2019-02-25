const knex = require('knex')
const debug = require('debug')('editor:config')
const getConfigFromEnvVars = require('./migration-helpers').getConfigFromEnvVars
const envInit = require('./env-init')

let config
let lastFetch = (new Date(0)).getTime()

const shouldRefetch = () => (Date.now() - lastFetch) > 15 * 1000

module.exports = async function fetchConfig () {
  if (process.env.BUILDING_WITHOUT_PG_ACCESS) {
    envInit('test')
    envInit('dev') // override
    const config = getConfigFromEnvVars()
    config.id = 1 // fake the config version
    return config
  }
  if (config && !shouldRefetch()) {
    debug('config served from cache')
    return config
  }
  debug('config fetched from db')
  const client = knex({
    client: 'pg',
    connection: {
      user: 'postgres',
      password: process.env.POSTGRESQL_PASSWORD,
      host: process.env.POSTGRESQL_HOST,
      database: process.env.POSTGRESQL_DATABASE
    }
  })
  const results = await client
    .withSchema('editor_schema')
    .select('id', 'forge', 'editor', 'ontology')
    .from('config')
    .orderBy('id', 'desc')
    .limit(1)
  client.destroy()

  if (!results.length) {
    throw new Error('Config missing from database')
  }
  config = results[0]
  lastFetch = Date.now()
  return config
}
