import Trifid from 'trifid-core'
import express from 'express'
import { join } from 'path'
import fetchConfig from '../setup/fetch-config'

const debug = require('debug')('editor:trifid')
const app = express()
app.set('trust proxy', 'loopback')
app.set('x-powered-by', null)

let middleware = null

process.on('SIGHUP', async () => {
  const config = await fetchConfig()
  middleware = await trifidMiddleware(config)
  debug('Trifid: middleware reloaded')
})

app.use(async function (req, res, next) {
  if (!middleware) {
    const config = await fetchConfig()
    if (config.editor.setup) {
      debug('dummy middleware')
      middleware = (req, res, next) => next()
    }
    else {
      debug('new middleware')
      middleware = await trifidMiddleware(config)
    }
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
          resource: `${config.ontology.datasetBaseUrl}${(config.ontology.ontologyResourceUrl || '').replace(new RegExp('^/', 'g'), '') || ''}`
        }
      }
    }
  }

  if (!process.env.NODE_TEST) {
    // outside of tests, avoid the security flaw of letting admins read
    // local files using `file:` URLs
    if (!config.ontology.structureRawUrl.startsWith('http')) {
      delete trifidConfig.handler.structure
    }
    if (!config.ontology.ontologyRawUrl.startsWith('http')) {
      delete trifidConfig.handler.ontology
      delete trifidConfig.handler.ontologyResource
    }
  }

  await trifid.init(trifidConfig)

  return trifid.middleware()
}
