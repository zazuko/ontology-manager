const knex = require('knex')
const debug = require('debug')('editor:config')
const envInit = require('./env-init')

let config
let lastFetch = (new Date(0)).getTime()

const shouldRefetch = () => (Date.now() - lastFetch) > 3 * 1000

module.exports = async function fetchConfig () {
  if (process.env.BUILDING_WITHOUT_PG_ACCESS) {
    return require('../fixtures/dummy-config')()
  }
  else {
    envInit()
  }
  if (config && !shouldRefetch()) {
    debug('config served from cache')
    return config
  }

  const client = knex({
    client: 'pg',
    connection: {}
  })

  const results = await client
    .withSchema('editor_schema')
    .select('id', 'forge', 'editor', 'ontology')
    .from('config')
    .orderBy('id', 'desc')
    .limit(1)
  client.destroy()

  if (results.length) {
    debug('config fetched from db')
  }
  else {
    debug('dummy config')
    return require('../fixtures/dummy-config')()
  }
  config = results[0]
  lastFetch = Date.now()
  return config
}
