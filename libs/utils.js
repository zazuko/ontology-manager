import _get from 'lodash/get'
import { quadToNTriples } from '@rdfjs/to-ntriples'

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
