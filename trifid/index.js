import Trifid from 'trifid-core'
import express from 'express'
import { join } from 'path'
import fetchConfig from '../setup/fetch-config'

const app = express()
app.set('trust proxy', 'loopback')
app.set('x-powered-by', null)

app.use(async function (req, res, next) {
  const middleware = await initMiddleware()
  middleware(req, res, next)
})

export default {
  path: '/',
  handler: app
}

async function initMiddleware () {
  const { ontology: ontologyConfig } = await fetchConfig()
  return trifidMiddleware(ontologyConfig)
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
