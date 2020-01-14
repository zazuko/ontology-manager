import rdf from 'rdf-ext'
import stringToStream from 'string-to-stream'
import N3Parser from 'rdf-parser-n3'
import axios from 'axios'

const debug = require('debug')('editor:trifid')

// * used by the store to refresh client-side dataset after a merge.
// Only used client-side, the other one cannot be used client-side because of
// knex
export default async function fetchDataset (editorConfig) {
  const ontologyFilename = editorConfig.ontology.ontologyRawUrl.substr(editorConfig.ontology.ontologyRawUrl.lastIndexOf('/') + 1)
  const structureFilename = editorConfig.ontology.structureRawUrl.substr(editorConfig.ontology.structureRawUrl.lastIndexOf('/') + 1)
  const editorUrl = `${editorConfig.editor.protocol}://${editorConfig.editor.host}`

  try {
    const [ontologyResponse = [], structureResponse = []] = await Promise.all([
      axios.get(`${editorUrl}/api/blob/${ontologyFilename}`),
      axios.get(`${editorUrl}/api/blob/${structureFilename}`)
    ])

    const ontologyString = ontologyResponse.data
    const structureString = structureResponse.data

    const parser = new N3Parser({ factory: rdf })
    const ontologyQuadStream = parser.import(stringToStream(ontologyString))
    const structureQuadStream = parser.import(stringToStream(structureString))

    const [ontologyDataset, structureDataset] = await Promise.all([
      rdf.dataset().import(ontologyQuadStream),
      rdf.dataset().import(structureQuadStream)
    ])

    return { ontologyDataset, structureDataset }
  }
  catch (err) {
    debug('dataset-fetch-client failed to fetch dataset from local API', err.message)
    debug(err)
  }
}
