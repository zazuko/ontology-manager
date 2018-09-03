const rdf = require('rdf-ext')
const stringToStream = require('string-to-stream')
const N3Parser = require('rdf-parser-n3')
const _ = require('lodash')

const {ontology} = require('../nuxt.config')
const GitHubAPIv3 = require('../api/github/api')
const api = new GitHubAPIv3(ontology.github)

const cacheTTL = 5

let ontologyDataset
let structureDataset
let cacheTimestamp = Date.now()

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

    // if no dataset yet or cache too old
    if (!ontologyDataset || (Date.now() - cacheTimestamp) > cacheTTL * 10 * 1000) {
      const branch = ontology.github.branch

      ;([ontologyDataset, structureDataset] = await Promise.all([
        api.getFile({branch, path: ontology.github.files.ontology}),
        api.getFile({branch, path: ontology.github.files.structure})
      ]).then(([ontologyString, structureString] = []) => {
        cacheTimestamp = Date.now()

        const parser = new N3Parser({factory: rdf})
        const ontologyQuadStream = parser.import(stringToStream(ontologyString))
        const structureQuadStream = parser.import(stringToStream(structureString))
        return Promise.all([
          rdf.dataset().import(ontologyQuadStream),
          rdf.dataset().import(structureQuadStream)
        ])
      }))

      req.ontology = ontologyDataset
      req.structure = structureDataset
    }

    req.ontology = _.cloneDeep(ontologyDataset)
    req.structure = _.cloneDeep(structureDataset)

    next()
  })
}
