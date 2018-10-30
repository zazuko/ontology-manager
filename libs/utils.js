import rdf from 'rdf-ext'
import { quadToNTriples } from '@rdfjs/to-ntriples'
import N3Parser from 'rdf-parser-n3'
import { Readable } from 'readable-stream'
import { datasetBaseUrl } from '@/trifid/trifid.config.json'
import { termIRI } from '@/libs/rdf'

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
    if (!(window.ontology instanceof rdf.defaults.Dataset)) {
      window.ontology = await deserialize(store.state.graph.ontologySerialized)
    }
    if (!(window.structure instanceof rdf.defaults.Dataset)) {
      window.structure = await deserialize(store.state.graph.structureSerialized)
    }
  }
}

export function arrayToGroups (obj, groupSize = 4) {
  return obj.children.reduce((groups, obj, i) => {
    const group = Math.floor(i / groupSize)
    if (!Array.isArray(groups[group])) {
      groups[group] = []
    }
    groups[group].push(obj)
    return groups
  }, [])
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
      node.properties = []
      node.type = 'container'

      if (label.length) {
        node.label = label[0].object.value
      } else {
        const label = dataset2.match(rdf.namedNode(iri), rdf.namedNode('http://www.w3.org/2000/01/rdf-schema#label')).toArray()
        if (label.length) {
          node.type = 'class'
          node.label = label[0].object.value
          node.properties = findClassProperties(iri, dataset2)
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

// Navigate a tree until a node with IRI=iri is found.
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
    this.isCreativeWork = !!quads.match(
      rdf.namedNode(this.iri),
      termIRI.a,
      rdf.namedNode('http://schema.org/CreativeWork')
    ).length
  }
}

export function hasCreativeWorkChild (obj) {
  if (!obj || !obj.children || !obj.children.length) {
    return false
  }

  for (const child of obj.children) {
    if (child.isCreativeWork) {
      return true
    }
    return !!hasCreativeWorkChild(child)
  }
}

export function findClassProperties (classIRI, dataset) {
  const type = termIRI.a
  const object = termIRI.Property

  const domain = termIRI.domain
  const classToSearchFor = rdf.namedNode(classIRI)

  return dataset
    .match(null, domain, classToSearchFor)
    .filter(({ subject }) => dataset.match(subject, type, object).toArray().length)
}

export function debounce (fn, delay) {
  let timeoutID
  return function () {
    clearTimeout(timeoutID)
    const args = arguments
    timeoutID = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
