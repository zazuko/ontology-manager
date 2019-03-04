const jwt = require('express-jwt')
const bodyParser = require('body-parser')
const express = require('express')
const fetchConfig = require('../setup/fetch-config')
const debug = require('debug')('editor:api')
const Router = require('express').Router
const pm2 = require('pm2')

const app = express()
app.use(bodyParser.json({ limit: '4mb' }))

const router = Router()

async function createApiMiddleware () {
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
  debug(`Starting Editor for ${process.env.CUSTOMER_NAME} with ${api} support, config v${editorConfig.id}`)
  return require(`./${api}`)(editorConfig)
}

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

  process.on('SIGHUP', async () => {
    apiMiddleware = await createApiMiddleware()
    debug('Editor API: apiMiddleware reloaded')
  })

  router.post('/reload-app', async (req, res, next) => {
    // This endpoint is protected by JWT, preventing malicious users
    // who found out about it to hit it often enough to DDoS
    const pids = await new Promise((resolve) => {
      pm2.list((err, processDescriptionList) => {
        if (err) {
          debug(err)
        }
        const signaled = []
        if (Array.isArray(processDescriptionList) && processDescriptionList.length) {
          // Signal all pm2-run editor servers
          processDescriptionList.forEach((pm2Process) => {
            process.kill(pm2Process.pid, 'SIGHUP')
            signaled.push(pm2Process.pid)
          })
        }
        else {
          // PM2 isn't running, only signal ourself
          process.kill(process.pid, 'SIGHUP')
          signaled.push(process.pid)
        }
        resolve(signaled)
      })
    })
    debug(`Sent SIGHUP to ${pids}`)
    res.json({ reloaded: pids })
  })

  app.use('/', async (req, res, next) => {
    if (!apiMiddleware) {
      apiMiddleware = await createApiMiddleware()
      debug('new middleware')
    }
    else {
      debug('cached middleware')
    }
    apiMiddleware(req, res, next)
  })

  app.use(router)
})()

module.exports = { path: '/api', handler: app }
