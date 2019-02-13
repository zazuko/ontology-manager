const _ = require('lodash')
const dotenv = require('dotenv')
const release = require('../package.json').version

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

  let editorConfig = {
    'head': {
      'title': 'Zazuko Ontology Editor Demo',
      'description': 'Linked Data Ontology Editor for Domain Specialists'
    },
    'github': {
      'repo': 'o',
      'owner': 'vhf',
      'branch': 'example-com'
    },
    'committer': {
      'name': 'Ontology Editor',
      'email': 'victor.felder@zazuko.com'
    }
  }
  try {
    editorConfig = Object.assign(editorConfig, JSON.parse(process.env.EDITOR_CONFIG))
  }
  catch (err) {
    console.error('failed to parse EDITOR_CONFIG')
  }

  const customer = _.snakeCase(process.env.CUSTOMER_NAME)

  const vars = {
    EDITOR_RELEASE: release,
    EDITOR_URL: `${process.env.EDITOR_PROTOCOL || 'http'}://${process.env.EDITOR_HOST || 'localhost:3000'}`,
    EDITOR_TITLE: editorConfig.head.title,
    EDITOR_DESCRIPTION: editorConfig.head.description,
    EDITOR_GITHUB_OWNER: editorConfig.github.owner,
    EDITOR_GITHUB_REPO: editorConfig.github.repo,
    EDITOR_GITHUB_BRANCH: editorConfig.github.branch,
    EDITOR_COMMITTER_NAME: editorConfig.committer.name,
    EDITOR_COMMITTER_EMAIL: editorConfig.committer.email,
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
  console.warn(`Environment init: ${env}`)
}
