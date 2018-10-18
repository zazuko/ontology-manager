const jwt = require('express-jwt')
const bodyParser = require('body-parser')
const express = require('express')
const config = require(require.resolve('../ontology.config.js'))

const app = express()

/**
Except when linking github oauth token with postgraphile JWT, all
API requests that come through here need a valid postgraphile JWT
*/
const filesRoutes = Object.values(config.github.files).map((file) => `/blob/${file}`)
const unprotectedRoutes = ['', '/link']
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
  if (config.github) {
    api = require('./github')
  } else if (config.gitlab) {
    api = require('./gitlab')
  } else {
    throw new Error('No forge API configured or configured forge API not found.')
  }

  return api
}
