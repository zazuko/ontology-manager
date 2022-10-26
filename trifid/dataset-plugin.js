let fetchDataset
let rdf

module.exports = handler

/**
 * This middleware runs on every page load, it fetchs the datasets and puts
 * them on the request
 */
async function handler (router) {
  if (!fetchDataset) {
    fetchDataset = await import('./dataset-fetch.mjs')
    fetchDataset = fetchDataset.default
  }

  if (!rdf) {
    rdf = await import('rdf-ext')
  }

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
