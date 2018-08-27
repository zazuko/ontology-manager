const bodyParser = require('body-parser')
const express = require('express')

const app = express()

app.use(bodyParser.json())
app.use('/', apiMiddleware())

module.exports = { path: '/api', handler: app }

function apiMiddleware () {
  const config = require(require.resolve('../nuxt.config.js')).ontology

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
