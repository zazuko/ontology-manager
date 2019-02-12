const jwt = require('express-jwt')
const bodyParser = require('body-parser')
const express = require('express')
const knex = require('knex')

const app = express()

/**
Except when linking github oauth token with postgraphile JWT, all
API requests that come through here need a valid postgraphile JWT
*/
const filesRoutes = [process.env.ONTOLOGY_FILENAME, process.env.STRUCTURE_FILENAME].map((file) => `/blob/${file}`)

const unprotectedRoutes = ['', '/link', '/cache', '/auth/login', '/auth/logout', '/auth/user']
  .concat(filesRoutes)
  .reduce((routes, route) => {
    const path = `/api${route}`
    routes.push(path)
    // no smart trailing slash handling unfortunately
    routes.push(`${path}/`)
    return routes
  }, [])

app.use(
  jwt({ secret: process.env.POSTGRAPHILE_TOKEN_SECRET })
    .unless({ path: unprotectedRoutes }))

app.use(bodyParser.json({ limit: '2mb' }))

async function fetchConfig () {
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
  return results[0]
}

(async () => {
  const editorConfig = await fetchConfig()

  let api
  if (process.env.NODE_TEST) {
    api = 'e2e-helpers'
  }
  else if (process.env.EDITOR_GITHUB_OWNER) {
    api = 'github'
  }
  else if (process.env.EDITOR_GITLAB_URL) {
    api = 'gitlab'
  }
  else {
    throw new Error('No forge API configured or configured forge API not found.')
  }
  console.warn(`Starting API middleware with ${api} support, config v${editorConfig.id}`)

  app.use('/', require(`./${api}`)(editorConfig))
})()

module.exports = { path: '/api', handler: app }
