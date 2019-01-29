import rdf from 'rdf-ext'
import stringToStream from 'string-to-stream'
import N3Parser from 'rdf-parser-n3'
import axios from 'axios'

// * used by a trifid plugin on first server requests
// * used by the store to refresh client-side dataset after a merge
export default async function fetchDataset () {
  try {
    const [ontologyResponse = [], structureResponse = []] = await Promise.all([
      axios.get(`${process.env.EDITOR_URL}/api/blob/${process.env.ONTOLOGY_FILENAME}`),
      axios.get(`${process.env.EDITOR_URL}/api/blob/${process.env.STRUCTURE_FILENAME}`)
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
    console.warn('Failed to fetch dataset from local API')
    console.error(err)
    throw err
  }
}
