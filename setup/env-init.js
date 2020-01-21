const _ = require('lodash')
const dotenv = require('dotenv')
const debug = require('debug')('editor:config')

const mandatoryEnvVars = [
  'CUSTOMER_NAME',
  'POSTGRAPHILE_TOKEN_SECRET'
]

module.exports = function envInit () {
  if (process.env.NODE_TEST) {
    // since dotenv doesn't overwrite existing env vars, load test env first
    dotenv.config({ path: '.env.test' })
  }
  dotenv.config()

  Object.entries(process.env).forEach(([key, value]) => {
    if (key.startsWith('POSTGRESQL_')) {
      process.env[key.replace('POSTGRESQL_', 'PG')] = value
    }
  })

  const missingEnvVars = mandatoryEnvVars.filter(name => !process.env[name])
  if (missingEnvVars.length) {
    console.error(`Missing mandatory environment variables: ${missingEnvVars.join(', ')}`)
    process.exit(-1)
  }

  const customer = _.snakeCase(process.env.CUSTOMER_NAME)

  const vars = {
    // logged in user role
    POSTGRESQL_ROLE_PERSON: `${customer}_role_person`,
    // anonymous user role
    POSTGRESQL_ROLE_ANONYMOUS: `${customer}_role_anonymous`
  }

  Object.entries(vars).forEach(([key, val]) => {
    if (!process.env[key]) {
      process.env[key] = val
    }
  })
  debug('Environment init')
}
