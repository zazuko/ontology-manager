const rdf = require('rdf-ext')
const stringToStream = require('string-to-stream')
const N3Parser = require('rdf-parser-n3')
const axios = require('axios')

const ontology = require('../ontology.config')

/**
 * This middleware runs on every page load, it fetchs the dataset and puts
 * it on the request, caching it for `cacheTTL` minutes.
 * It always puts a clone of it, that way the cache always keeps a clean copy.
 * req.dataset is caught by vuex, which makes it available to the client
 */
module.exports = function handler (router) {
  router.use(async (req, res, next) => {
    // skip when trifid handles it
    if (req.iri && req.iri.startsWith('http')) {
      next()
      return
    }

    const [ontologyDataset, structureDataset] = await Promise.all([
      axios.get(`http://${process.env.EDITOR_HOST}/api/blob/${ontology.github.files.ontology}`),
      axios.get(`http://${process.env.EDITOR_HOST}/api/blob/${ontology.github.files.structure}`)
    ]).then(([ontologyResponse, structureResponse] = []) => {
      const ontologyString = ontologyResponse.data
      const structureString = structureResponse.data

      const parser = new N3Parser({ factory: rdf })
      const ontologyQuadStream = parser.import(stringToStream(ontologyString))
      const structureQuadStream = parser.import(stringToStream(structureString))
      return Promise.all([
        rdf.dataset().import(ontologyQuadStream),
        rdf.dataset().import(structureQuadStream)
      ])
    })

    req.ontology = ontologyDataset
    req.structure = structureDataset

    next()
  })
}
