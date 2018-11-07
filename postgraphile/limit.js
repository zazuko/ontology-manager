const bodyParser = require('body-parser')
const express = require('express')

const app = express()

app.use(bodyParser.json({ limit: '2mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', limit)

module.exports = { path: '/graphql', handler: app }

function limit (req, res, next) {
  if (req.body && req.body.query) {
    const depth = req.body.query.split('{').length
    if (depth > 15 && !req.body.query.trim().startsWith('query IntrospectionQuery')) {
      res.status(400)
      console.error(`Query limit reached! (depth was: ${depth})`)
      console.error(req.body.query)
      return res.json({
        errors: [{
          message: 'Query limit reached'
        }]
      })
    }
  }
  next()
}
