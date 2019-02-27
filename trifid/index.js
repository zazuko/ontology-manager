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
    const config = await fetchConfig()
    middleware = await trifidMiddleware(config)
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

async function trifidMiddleware (config) {
  const trifid = new Trifid()
  const trifidConfig = {
    baseConfig: `${join(__dirname, 'trifid.config-base.json')}`,
    datasetBaseUrl: config.ontology.datasetBaseUrl,
    classBaseUrl: config.ontology.classBaseUrl,
    propertyBaseUrl: config.ontology.propertyBaseUrl,
    containersNestingPredicate: config.ontology.containersNestingPredicate,
    handler: {
      structure: {
        module: 'trifid-handler-fetch',
        priority: 100,
        options: {
          url: config.ontology.structureRawUrl,
          contentType: 'application/n-triples',
          split: true
        }
      },
      ontology: {
        module: 'trifid-handler-fetch',
        priority: 101,
        options: {
          url: config.ontology.ontologyRawUrl,
          contentType: 'application/n-triples',
          split: true
        }
      },
      ontologyResource: {
        module: 'trifid-handler-fetch',
        priority: 10,
        options: {
          url: config.ontology.ontologyRawUrl,
          contentType: 'application/n-triples',
          resource: `${config.ontology.datasetBaseUrl}${config.ontology.ontologyResourceUrl.replace(new RegExp('^/', 'g'), '') || ''}`
        }
      }
    }
  }

  await trifid.init(trifidConfig)

  return trifid.middleware()
}
