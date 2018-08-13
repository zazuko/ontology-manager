const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const api = require('./api')

app.use('/', api)

module.exports = { path: '/api', handler: app }
