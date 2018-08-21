const bodyParser = require('body-parser')
const express = require('express')

const config = require(require.resolve('../nuxt.config.js')).ontology

const app = express()

app.use(bodyParser.json())

let api
if (config.github) {
  api = require('./github')(config.github)
} else if (config.gitlab) {
  api = require('./gitlab')(config.gitlab)
} else {
  throw new Error('No forge API configured or configured forge API not found.')
}
app.use('/', api)

module.exports = { path: '/api', handler: app }
