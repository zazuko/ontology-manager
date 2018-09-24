import rdf from 'rdf-ext'
import N3Parser from 'rdf-parser-n3'
import { Readable } from 'stream'

export const toastClose = {
  action: {
    text: 'Close',
    onClick: (e, toastObject) => {
      toastObject.goAway(0)
    }
  }
}

export async function datasetsSetup (store) {
  if (process.client) {
    if (!window.ontology) {
      window.ontology = await deserialize(store.state.graph.ontologySerialized)
    }
    if (!window.structure) {
      window.structure = await deserialize(store.state.graph.structureSerialized)
    }
  }
}

async function deserialize (string) {
  const parser = new N3Parser({ factory: rdf })

  const input = new Readable({
    read: () => {
      input.push(string)
      input.push(null)
    }
  })

  const quadStream = parser.import(input)
  const dataset = await rdf.dataset().import(quadStream)
  return dataset
}
