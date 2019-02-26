import jwt from 'express-jwt'
import fetchDataset from './dataset-fetch'

const debug = require('debug')('editor:trifid')

let datasets = null

module.exports = handler

/**
 * This middleware runs on every page load, it fetchs the dataset and puts
 * it on the request
 */
function handler (router) {
  router.post(
    '/trifid/reload-datasets',
    jwt({ secret: process.env.POSTGRAPHILE_TOKEN_SECRET }),
    (req, res, next) => {
      datasets = null
      debug('manually cleared datasets')
      res.json({ success: true })
    }
  )

  router.use(async (req, res, next) => {
    // skip when trifid handles it
    if (req.iri && req.iri.startsWith('http')) {
      next()
      return
    }

    if (!datasets) {
      datasets = await fetchDataset()
    }
    const { ontologyDataset, structureDataset } = datasets

    req.ontology = ontologyDataset
    req.structure = structureDataset

    next()
  })
}
