import jwt from 'express-jwt'
import Trifid from 'trifid-core'
import express from 'express'
import { join } from 'path'
import fetchConfig from '../setup/fetch-config'

const router = express.Router()
const debug = require('debug')('editor:trifid')
const app = express()
app.set('trust proxy', 'loopback')
app.set('x-powered-by', null)

let middleware = null
let installConfigReloader = true

app.use(async function (req, res, next) {
  router.post(
    '/trifid/reload-config',
    jwt({ secret: process.env.POSTGRAPHILE_TOKEN_SECRET }),
    (req, res, next) => {
      middleware = null
      debug('manually cleared config')
      res.json({ success: true })
    }
  )
  if (installConfigReloader) {
    app.use(router)
    installConfigReloader = false
  }

  if (!middleware) {
    debug('new middleware')
    const { ontology: ontologyConfig } = await fetchConfig()
    middleware = await trifidMiddleware(ontologyConfig)
  }
  else {
    debug('cached middleware')
  }

  middleware(req, res, next)
})

export default {
  path: '/',
  handler: app
}

async function trifidMiddleware (ontologyConfig) {
  const trifid = new Trifid()
  const config = {
    baseConfig: `${join(__dirname, 'trifid.config-base.json')}`,
    datasetBaseUrl: ontologyConfig.datasetBaseUrl,
    classBaseUrl: ontologyConfig.classBaseUrl,
    propertyBaseUrl: ontologyConfig.propertyBaseUrl,
    containersNestingPredicate: ontologyConfig.containersNestingPredicate,
    handler: {
      structure: {
        module: 'trifid-handler-fetch',
        priority: 100,
        options: {
          url: ontologyConfig.structureRawUrl,
          contentType: 'application/n-triples',
          split: true
        }
      },
      ontology: {
        module: 'trifid-handler-fetch',
        priority: 101,
        options: {
          url: ontologyConfig.ontologyRawUrl,
          contentType: 'application/n-triples',
          split: true
        }
      }
    }
  }

  await trifid.init(config)

  return trifid.middleware()
}
