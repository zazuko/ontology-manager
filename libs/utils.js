import _camelCase from 'lodash/camelCase'
import _get from 'lodash/get'
import _upperFirst from 'lodash/upperFirst'
import { namedNode } from '@rdfjs/data-model'
import { quadToNTriples } from '@rdfjs/to-ntriples'
import rdf from 'rdf-ext'

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
  return (iri || '').toLowerCase().replace(/[^a-z]/g, '_')
}

export function childClassesCount (obj, sum = 0, recursing = false) {
  if ('childClassesCount' in obj) {
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
  if ('childPropertiesCount' in obj) {
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

function iri (o) {
  return o.iri ? o.iri().value : o.toString()
}

export function term (o) {
  if (!o) {
    return undefined
  }

  const oIri = iri(o)
  if (oIri === '[object Object]') {
    throw new Error(`Cannot call term() on '${JSON.stringify(o)}'`)
  }

  return (oIri.match(new RegExp('[^/^#]+(?=$)')) || [])[0]
}

export function normalizeLabel (label, type = 'pascal') {
  const camel = _camelCase(label)
  return encodeURIComponent(type === 'pascal' ? _upperFirst(camel) : camel)
}

export function datasetToCanonicalN3 (dataset) {
  return dataset.toArray()
    .map(quad => quad.toString())
    .sort((a, b) => a.localeCompare(b))
    .join('\n') + '\n' // files should always end with a nl
}

export function firstVal (xs = []) {
  if (!Array.isArray(xs)) {
    throw new Error('Argument should be an array')
  }
  if (xs.length) {
    const first = xs[0]
    if ('subject' in first && 'predicate' in first && 'object' in first) {
      return first
    }
    return first.value
  }
  return ''
}

export function buildAdjacencyList (trees) {
  const acc = {}
  for (const tree of trees) {
    traverse(tree)
  }

  function traverse (node) {
    acc[node.iri] = acc[node.iri] || []
    for (const child of node.children) {
      acc[node.iri].push(traverse(child))
    }
    return node.iri
  }
  return acc
}

export function isCyclicTree (tree) {
  const adjacencyList = buildAdjacencyList(tree)
  return isCyclic(adjacencyList)
}

export function isCyclic (adjacencyList) {
  function recursiveCheck (node, visited, stack) {
    visited[node] = true
    stack[node] = true
    for (const child of (adjacencyList[node] || [])) {
      if (!visited[child]) {
        if (recursiveCheck(child, visited, stack)) {
          return true
        }
      }
      else if (stack[child]) {
        return true
      }
    }
    stack[node] = false
    return false
  }

  const visited = {}
  const stack = {}
  Object.keys(adjacencyList).forEach((key) => {
    visited[key] = false
    stack[key] = false
  })

  for (const node of Object.keys(adjacencyList)) {
    if (!visited[node] && recursiveCheck(node, visited, stack)) {
      return true
    }
  }
  return false
}

export function getVersion (dataset) {
  const quads = dataset.match(null, namedNode('http://schema.org/version')).toArray()
    .filter(({ subject, object }) => subject.termType === 'BlankNode' && object.termType === 'Literal')
  if (quads.length) {
    return parseInt(quads[0].object.value, 10)
  }
  return 0
}

export function bumpVersion (structureDataset) {
  const version = getVersion(structureDataset)
  const versionQuads = structureDataset.match(null, namedNode('http://schema.org/version')).toArray()
    .filter(({ subject, object }) => subject.termType === 'BlankNode' && object.termType === 'Literal')
  versionQuads.forEach((quad) => {
    structureDataset.removeMatches(quad.subject, quad.predicate, quad.object)
  })
  const subject = versionQuads.length ? versionQuads[0].subject : rdf.blankNode()
  const versionQuad = rdf.quad(subject, namedNode('http://schema.org/version'), rdf.literal(version + 1, rdf.namedNode('http://www.w3.org/2001/XMLSchema#integer')))
  structureDataset.add(versionQuad)
}
