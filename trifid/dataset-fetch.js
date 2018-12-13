import rdf from 'rdf-ext'
import stringToStream from 'string-to-stream'
import N3Parser from 'rdf-parser-n3'
import axios from 'axios'

const config = require('../editor.config')

// * used by a trifid plugin on first server requests
// * used by the store to refresh client-side dataset after a merge
export default async function fetchDataset () {
  const [ontologyDataset, structureDataset] = await Promise.all([
    axios.get(`${config.website.url}/api/blob/${config.github.files.ontology}`),
    axios.get(`${config.website.url}/api/blob/${config.github.files.structure}`)
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

  return { ontologyDataset, structureDataset }
}
