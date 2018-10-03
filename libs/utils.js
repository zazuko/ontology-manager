import rdf from 'rdf-ext'
import { quadToNTriples } from '@rdfjs/to-ntriples'
import N3Parser from 'rdf-parser-n3'
import { Readable } from 'readable-stream'
import { datasetBaseUrl } from '@/trifid/trifid.config.json'

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

export function serialize (dataset) {
  return dataset._quads
    .map((quad) => quadToNTriples(quad))
    .join('\n')
}

export function buildTree (dataset, dataset2) {
  if (!dataset) return {}

  const predicate = rdf.namedNode('http://schema.org/hasPart')

  // we consider <parentIRI> <givenPredicate> <childIRI>

  const nodes = {}

  dataset
    .match(null, predicate)
    .toArray()
    .forEach((quad) => {
      const parent = nodes[quad.subject.value] || (nodes[quad.subject.value] = new Node(quad.subject.value, undefined, dataset.match(quad.subject)))
      const child = nodes[quad.object.value] || (nodes[quad.object.value] = new Node(quad.object.value, parent, dataset.match(quad.object)))
      child.parent = parent
      parent.children.push(child)
    })

  const forest = Object.keys(nodes)
    .reduce((acc, iri) => {
      const node = nodes[iri]
      node.path = `/${iri.replace(datasetBaseUrl, '')}`
      let label = dataset.match(rdf.namedNode(iri), rdf.namedNode('http://www.w3.org/2000/01/rdf-schema#label')).toArray()
      node.label = iri
      if (label.length) {
        node.label = label[0].object.value
      } else {
        const label = dataset2.match(rdf.namedNode(iri), rdf.namedNode('http://www.w3.org/2000/01/rdf-schema#label')).toArray()
        if (label.length) {
          node.label = label[0].object.value
        }
      }

      // then it's a root
      if (!node.parent) {
        acc.push(node)
      }
      node.parent = null
      return acc
    }, [])

  return forest
}

export function findSubtreeInForest (nodes, iri) {
  for (const node of nodes) {
    if (node.iri === iri) {
      return node
    }
    const found = findSubtreeInForest(node.children, iri)
    if (found) {
      return found
    }
  }
}

class Node {
  constructor (iri, parent, quads, children = []) {
    this.iri = iri
    this.parent = parent
    this.quads = quads
    this.children = children
  }
}
