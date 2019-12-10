import fetchDataset from './dataset-fetch'
import rdf from 'rdf-ext'

module.exports = handler

/**
 * This middleware runs on every page load, it fetchs the datasets and puts
 * them on the request
 */
function handler (router) {
  router.use(async (req, res, next) => {
    // skip when trifid handles it
    if (req.iri && req.iri.startsWith('http')) {
      next()
      return
    }

    const datasets = await fetchDataset()
    const { ontologyDataset, structureDataset } = datasets || {}

    req.ontology = ontologyDataset || rdf.dataset()
    req.structure = structureDataset || rdf.dataset()

    next()
  })
}
