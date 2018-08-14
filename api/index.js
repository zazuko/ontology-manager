const bodyParser = require('body-parser')
const express = require('express')

const app = express()

app.use(bodyParser.json())

const api = require('./api')
app.use('/', api)

module.exports = { path: '/api', handler: app }
