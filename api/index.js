const jwt = require('express-jwt')
const bodyParser = require('body-parser')
const express = require('express')

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
app.use('/', apiMiddleware())

module.exports = { path: '/api', handler: app }

function apiMiddleware () {
  let api

  if (process.env.E2E) {
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
  console.warn(`Starting API server with ${api} support`)

  return require(`./${api}`)
}
