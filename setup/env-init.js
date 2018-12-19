const _ = require('lodash')
const dotenv = require('dotenv')

const environments = {
  dev: `${__dirname}/../docker-app-dev/.env`,
  test: `${__dirname}/test/.env`
}

module.exports = function envInit (env = 'dev') {
  if (!environments.hasOwnProperty(env)) {
    throw new Error('env arg missing')
  }

  // load env vars
  dotenv.config({ path: environments[env] })

  const customer = _.snakeCase(process.env.CUSTOMER_NAME)

  const vars = {
    POSTGRESQL_DATABASE: `${customer}_db`,
    // logged in user role
    POSTGRESQL_ROLE_PERSON: `${customer}_role_person`,
    // anonymous user role
    POSTGRESQL_ROLE_ANONYMOUS: `${customer}_role_anonymous`,
    // postgraphile internal pg role
    POSTGRESQL_ROLE_POSTGRAPHILE: `${customer}_role_postgraphile`,
    ONTOLOGY_FILENAME: process.env.ONTOLOGY_RAW_URL.substr(process.env.ONTOLOGY_RAW_URL.lastIndexOf('/') + 1),
    STRUCTURE_FILENAME: process.env.STRUCTURE_RAW_URL.substr(process.env.STRUCTURE_RAW_URL.lastIndexOf('/') + 1)
  }

  Object.entries(vars).forEach(([key, val]) => {
    process.env[key] = val
  })
  console.warn(`Environment init: ${env}`)
}
