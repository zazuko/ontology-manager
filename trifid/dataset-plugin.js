import fetchDataset from './dataset-fetch'

module.exports = handler

/**
 * This middleware runs on every page load, it fetchs the dataset and puts
 * it on the request
 */
function handler (router) {
  router.use(async (req, res, next) => {
    // skip when trifid handles it
    if (req.iri && req.iri.startsWith('http')) {
      next()
      return
    }

    const { ontologyDataset, structureDataset } = await fetchDataset()

    req.ontology = ontologyDataset
    req.structure = structureDataset

    next()
  })
}
