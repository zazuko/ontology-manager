const _ = require('lodash')
const bodyParser = require('body-parser')
const debug = require('debug')('editor:api')
const express = require('express')
const gql = require('graphql-tag')
const jwt = require('express-jwt')
const knex = require('knex')
const pm2 = require('pm2')

const apolloClientFactory = require('./getApolloClient')
const fetchConfig = require('../setup/fetch-config')
const dummyConfig = require('../fixtures/dummy-config')

const app = express()
app.use(bodyParser.json({ limit: '4mb' }))

const router = express.Router()

async function createApiMiddleware () {
  const editorConfig = await fetchConfig()

  if (editorConfig.editor.setup) {
    // the editor hasn't been configured yet
    debug('dummy middleware')
    return (req, res, next) => next()
  }

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
  let unprotectedRoutes = ['', '/health', '/link', '/cache', '/auth/login', '/auth/logout', '/auth/user', '/reboot-app', '/setup']
  if (process.env.NODE_TEST) {
    unprotectedRoutes.push('/log')
  }
  unprotectedRoutes = unprotectedRoutes.reduce((routes, route) => {
    const path = `/api${route}`
    routes.push(path)
    // no smart trailing slash handling unfortunately
    routes.push(`${path}/`)
    return routes
  }, []).concat(new RegExp('/api/blob/.*'))

  app.use(
    jwt({ secret: process.env.POSTGRAPHILE_TOKEN_SECRET }).unless({
      path: unprotectedRoutes
    })
  )

  let apiMiddleware = null

  process.on('SIGHUP', async () => {
    apiMiddleware = await createApiMiddleware()
    debug('Editor API: apiMiddleware reloaded')
  })

  router.post('/setup', async (req, res, next) => {
    // This endpoint can only be triggered before any config exists in the DB.
    // Since the data received here will configure axios, we cannot use axios yet so
    // we resort to writing the dummy config to DB with the parts that will configure
    // nuxt after the forced restart.
    const editorConfig = await fetchConfig()
    if (editorConfig.editor.setup !== 'step1') {
      debug('Cannot call /api/setup when setup already done')
      return
    }
    if (!req.body.host) {
      const error = 'Missing "host"'
      debug(error)
      res.json({ error })
    }
    if (!req.body.protocol) {
      const error = 'Missing "protocol"'
      debug(error)
      res.json({ error })
    }

    const { editor, ontology, forge } = dummyConfig()
    editor.protocol = req.body.protocol
    editor.host = req.body.host
    editor.setup = 'step2'
    ontology.ontologyRawUrl = 'https://raw.githubusercontent.com/<username>/<repo>/<branch>/<ontology-file>.nt'
    ontology.structureRawUrl = 'https://raw.githubusercontent.com/<username>/<repo>/<branch>/<structure-file>.nt'

    try {
      const client = knex({
        client: 'pg',
        connection: {}
      })
      await client('editor_schema.config').insert({ editor, ontology, forge, reason: 'Installation step 1' })
      const replace = require('../setup/replace-vars')
      await replace()
    }
    catch (err) {
      debug(err)
      res.json({ error: err.message })
      return
    }

    await reboot()
    res.json({ success: true })
  })

  router.post('/reboot-app', async (req, res, next) => {
    // This endpoint can only be triggered before any user sign up on the editor.
    // It allows rebooting the editor after the initial setup in order for the
    // admin who set it up to sign in for the first time.

    const replace = require('../setup/replace-vars')
    await replace()

    const anonApolloClient = await apolloClientFactory()
    const result = await anonApolloClient.query({
      query: gql`{
        allPeople {
          nodes {
            id
          }
        }
      }`
    })

    const userCount = _.get(result, 'data.allPeople.nodes.length', 0)
    if (userCount !== 0) {
      return res.json(false)
    }
    const pids = await reboot()
    res.json({ killed: pids })
  })

  router.post('/reload-app', async (req, res, next) => {
    // This endpoint is protected by JWT, preventing malicious users
    // who found out about it to hit it often enough to DDoS

    const replace = require('../setup/replace-vars')
    await replace()

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

async function reboot () {
  const pids = await new Promise((resolve) => {
    pm2.list((err, processDescriptionList) => {
      if (err) {
        debug(err)
      }

      if (Array.isArray(processDescriptionList) && processDescriptionList.length) {
        // Shutdown and restart all pm2-run processes
        pm2.connect((err) => {
          if (err) {
            debug(err)
            processDescriptionList.forEach(({ pid }) => {
              process.kill(pid, 'SIGKILL')
            })
            pm2.disconnect()
          }
          pm2.restart('all', (err) => {
            if (err) {
              debug(err)
            }
            pm2.disconnect()
            resolve(processDescriptionList.map((pm2Process) => pm2Process.pid))
          })
        })
      }
      else {
        // PM2 isn't running, only signal ourself
        process.kill(process.pid, 'SIGKILL')
      }
      resolve([process.pid])
    })
  })
  debug(`Sent SIGKILL to ${pids}`)
  return pids
}
