const knex = require('knex')

let config

module.exports = async function fetchConfig () {
  if (config) {
    return config
  }
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
  return config
}
