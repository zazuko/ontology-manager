import _get from 'lodash/get'
import rdf from 'rdf-ext'
import { quadToNTriples } from '@rdfjs/to-ntriples'
import { termIRI } from '@/libs/rdf'

const datasetBaseUrl = process.env.DATASET_BASE_URL
const containersNestingPredicates = [process.env.CONTAINERS_NESTING_PREDICATE]

export const toastClose = {
  action: {
    text: 'Close',
    onClick: (e, toastObject) => {
      toastObject.goAway(0)
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

export function serialize (dataset) {
  return dataset
    .toArray()
    .map((quad) => quadToNTriples(quad))
    .join('\n')
}

export function buildTree (structureDataset, ontologyDataset) {
  if (!structureDataset) {
    return {}
  }

  const nodes = {}

  // we consider <parentIRI> <givenPredicate> <childIRI>
  containersNestingPredicates.forEach((predicate) => {
    structureDataset
      .match(null, rdf.namedNode(predicate))
      .toArray()
      .forEach((quad) => {
        const parent = nodes[quad.subject.value] || (nodes[quad.subject.value] = new Node(quad.subject.value, undefined, structureDataset.match(quad.subject)))
        const child = nodes[quad.object.value] || (nodes[quad.object.value] = new Node(quad.object.value, parent, structureDataset.match(quad.object)))
        child.parent = parent
        parent.children.push(child)
      })
  })

  const modifiedDataset = structureDataset.merge(ontologyDataset).match(null, termIRI.modified)

  const forest = Object.keys(nodes)
    .reduce((acc, iri) => {
      const node = nodes[iri]
      node.path = `/${iri.replace(datasetBaseUrl, '')}`
      node.properties = []
      node.type = 'container'

      const modified = modifiedDataset.match(rdf.namedNode(iri), termIRI.modified).toArray()
      node.modified = modified.length ? modified[0].object.value : ''

      node.label = iri
      let label = structureDataset.match(rdf.namedNode(iri), termIRI.label).toArray()
      if (label.length) {
        node.label = label[0].object.value
      }
      else {
        label = ontologyDataset.match(rdf.namedNode(iri), termIRI.label).toArray()
        if (label.length) {
          node.type = 'class'
          node.label = label[0].object.value
          node.properties = findClassProperties(iri, ontologyDataset)
        }
      }

      if (!node.parent) {
        // then it's a root
        acc.push(node)
      }
      node.parent = null
      return acc
    }, [])

  return forest
}

// Navigate a tree until a node with IRI=iri is found.
export function findSubtreeInForest (nodes, iri) {
  for (const node of Array.from(nodes)) {
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

export function collectChildren (obj, steps = {}, path = 'propChildren') {
  const nextPath = path.endsWith('propChildren') ? 'classChildren' : 'propChildren'

  if (!Array.isArray(obj)) {
    return steps
  }
  obj.forEach((child, n) => {
    const thisPath = `${path}[${n}]`
    steps[thisPath] = child
    if (Array.isArray(child[nextPath])) {
      collectChildren(child[nextPath], steps, [thisPath, nextPath].join('.'))
    }
  })
  return steps
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

export function iriToId (iri) {
  return iri.toLowerCase().replace(/[^a-z]/g, '_')
}

export function headTitle (title) {
  return `${title} - ${process.env.EDITOR_TITLE}`
}

export function childClassesCount (obj, sum = 0, recursing = false) {
  if (obj.hasOwnProperty('childClassesCount')) {
    return obj.childClassesCount
  }
  let count
  if (_get(obj, 'children.length', false)) {
    const childCount = obj.children.reduce((acc, child) => childClassesCount(child, acc, true), sum)
    count = (obj.type === 'class' ? 1 : 0) + childCount
  }
  else {
    count = sum + (obj.type === 'class' ? 1 : 0)
  }
  if (!recursing) {
    obj.childClassesCount = count
  }
  return count
}
export function childPropertiesCount (obj) {
  // returned cached version if we have it
  if (obj.hasOwnProperty('childPropertiesCount')) {
    return obj.childPropertiesCount
  }
  // compute it
  const properties = _childPropertiesCount(obj)
    .reduce((tmp, p) => {
      tmp[p.subject.value] = true
      return tmp
    }, {})
  const count = Object.keys(properties).length
  // cache it
  obj.childPropertiesCount = count
  return count
}

function _childPropertiesCount (obj, properties = []) {
  if (obj.children) {
    const prop = Array.isArray(obj.properties) ? obj.properties : obj.properties.toArray()
    const childProps = obj.children.reduce((acc, child) => _childPropertiesCount(child, acc), properties)
    return prop.concat(childProps)
  }
  return obj.properties.toArray()
}
