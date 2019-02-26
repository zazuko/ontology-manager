const _ = require('lodash')
const dotenv = require('dotenv')
const debug = require('debug')('editor')

const environments = {
  dev: `${__dirname}/../docker-app-dev/.env`,
  test: `${__dirname}/../test/.env`
}

module.exports = function envInit (env = process.env.NODE_TEST ? 'test' : 'dev') {
  if (!environments.hasOwnProperty(env)) {
    throw new Error('env arg missing')
  }

  // load env vars
  dotenv.config({ path: environments[env] })

  const customer = _.snakeCase(process.env.CUSTOMER_NAME)

  const vars = {
    // other config
    POSTGRESQL_DATABASE: `${customer}_db`,
    // logged in user role
    POSTGRESQL_ROLE_PERSON: `${customer}_role_person`,
    // anonymous user role
    POSTGRESQL_ROLE_ANONYMOUS: `${customer}_role_anonymous`,
    // postgraphile internal pg role
    POSTGRESQL_ROLE_POSTGRAPHILE: `${customer}_role_postgraphile`
  }

  Object.entries(vars).forEach(([key, val]) => {
    process.env[key] = val
  })
  debug(`Environment init: ${env}`)
}
