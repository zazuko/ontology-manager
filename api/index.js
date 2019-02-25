const jwt = require('express-jwt')
const bodyParser = require('body-parser')
const express = require('express')
const fetchConfig = require('../setup/fetch-config')
const debug = require('debug')('editor:api')
const Router = require('express').Router

const app = express()
app.use(bodyParser.json({ limit: '4mb' }))

const router = Router()

;(async () => {
  /**
  Except when linking github oauth token with postgraphile JWT, all
  API requests that come through here need a valid postgraphile JWT
  */
  const unprotectedRoutes = ['', '/link', '/cache', '/auth/login', '/auth/logout', '/auth/user']
    .reduce((routes, route) => {
      const path = `/api${route}`
      routes.push(path)
      // no smart trailing slash handling unfortunately
      routes.push(`${path}/`)
      return routes
    }, [])

  app.use(
    jwt({ secret: process.env.POSTGRAPHILE_TOKEN_SECRET }).unless({
      path: unprotectedRoutes.concat(new RegExp('/api/blob/.*'))
    })
  )

  let apiMiddleware = null
  let installConfigReloader = true
  app.use('/', async (req, res, next) => {
    router.post('/reload-config', (req, res, next) => {
      apiMiddleware = null
      debug('manually cleared config')
      res.json({ success: true })
    })
    if (installConfigReloader) {
      app.use(router)
      installConfigReloader = false
    }

    if (!apiMiddleware) {
      debug('new middleware')
      const editorConfig = await fetchConfig()
      let api
      if (process.env.NODE_TEST) {
        api = 'e2e-helpers'
      }
      else if (editorConfig.editor.github) {
        api = 'github'
      }
      else if (editorConfig.editor.gitlab) {
        api = 'gitlab'
      }
      else {
        throw new Error('No forge API configured or configured forge API not found.')
      }
      console.warn(`Starting Editor for ${process.env.CUSTOMER_NAME} with ${api} support, config v${editorConfig.id}`)
      apiMiddleware = await require(`./${api}`)(editorConfig)
    } else {
      debug('cached middleware')
    }
    apiMiddleware(req, res, next)
  })
})()

module.exports = { path: '/api', handler: app }
