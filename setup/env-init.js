const _ = require('lodash')
const dotenv = require('dotenv')
const debug = require('debug')('editor:config')

const mandatoryEnvVars = [
  'CUSTOMER_NAME',
  'POSTGRESQL_PASSWORD',
  'POSTGRESQL_HOST',
  'POSTGRESQL_ROLE_POSTGRAPHILE_PASSWORD',
  'POSTGRAPHILE_TOKEN_SECRET'
]

const environments = {
  prod: `${__dirname}/../docker-app-prod/.env`, // this file is empty on purpose!
  dev: `${__dirname}/../docker-app-dev/.env`,
  test: `${__dirname}/../test/.env`
}

module.exports = function envInit (env) {
  if (!env) {
    if (process.env.NODE_TEST) {
      env = 'test'
    }
    else if (process.env.NODE_ENV === 'production') {
      env = 'prod'
    }
    else {
      env = 'dev'
    }
    debug(`envInit: '${env}'`)
  }

  if (!environments.hasOwnProperty(env)) {
    throw new Error('Cannot call `envInit` without proper env')
  }

  // load env vars
  dotenv.config({ path: environments[env] })

  const missingEnvVars = mandatoryEnvVars.filter(name => !process.env[name])
  if (missingEnvVars.length) {
    console.error(`Missing mandatory environment variables: ${missingEnvVars.join(', ')}`)
    process.exit(-1)
  }

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
