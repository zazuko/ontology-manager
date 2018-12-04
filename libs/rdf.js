import { compareTwoStrings } from 'string-similarity'
import _camelCase from 'lodash/camelCase'
import _upperFirst from 'lodash/upperFirst'
import rdf from 'rdf-ext'

import { datasetBaseUrl } from '@/trifid/trifid.config.json'
import Literal from '@rdfjs/data-model/lib/literal'

const stringIRI = {
  a: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',

  Property: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
  Class: 'http://www.w3.org/2000/01/rdf-schema#Class',

  label: 'http://www.w3.org/2000/01/rdf-schema#label',
  comment: 'http://www.w3.org/2000/01/rdf-schema#comment',
  description: 'http://www.w3.org/2004/02/skos/core#note',
  example: 'http://www.w3.org/2004/02/skos/core#example',

  domain: 'http://schema.org/domainIncludes',
  range: 'http://schema.org/rangeIncludes',

  created: 'http://purl.org/dc/terms/created', // not used atm
  modified: 'http://purl.org/dc/terms/modified',
  deprecated: 'http://www.w3.org/2002/07/owl#deprecated',

  hasPart: 'http://schema.org/hasPart',
  creativeWork: 'http://schema.org/CreativeWork'
}

export const termIRI = Object
  .entries(stringIRI)
  .reduce((acc, [key, val]) => {
    acc[key] = rdf.namedNode(val)
    return acc
  }, {})

const createXsdType = ([iri, label]) =>
  rdf.quad(rdf.namedNode(iri), termIRI.label, rdf.literal(label))

const xsdTypes = [
  ['http://www.w3.org/2001/XMLSchema#boolean', 'Boolean'],
  ['http://www.w3.org/2001/XMLSchema#date', 'Date'],
  ['http://www.w3.org/2001/XMLSchema#dateTime', 'Date and time'],
  ['http://www.w3.org/2001/XMLSchema#double', 'Double'],
  ['http://www.w3.org/2001/XMLSchema#int', 'Integer'],
  ['http://www.w3.org/2001/XMLSchema#string', 'String'],
  ['http://www.w3.org/2001/XMLSchema#time', 'Time']
].map(createXsdType)

function toObject (domain, dataset) {
  let label = dataset.match(domain.subject, termIRI.label).toArray()
  if (Array.isArray(label)) {
    if (label.length) {
      label = label[0].object.value
    }
    else {
      label = ''
    }
  }
  if (!label && domain.object instanceof Literal) {
    label = domain.object.value
  }

  let comment = dataset.match(domain.subject, termIRI.comment).toArray()
  if (Array.isArray(comment)) {
    if (comment.length) {
      comment = comment[0].object.value
    }
    else {
      comment = ''
    }
  }

  return {
    domain,
    label,
    comment
  }
}

export function domainsSearchFactory (dataset, resultType, addXSDTypes = false) {
  if (!['Class', 'Property'].includes(resultType)) {
    throw new Error(`Cannot search for unknown type '${resultType}'`)
  }

  const domainsDataset = dataset
    .match(null, termIRI.a, termIRI[resultType])

  if (addXSDTypes) {
    domainsDataset.addAll(xsdTypes)
  }

  return (searchInput = '') => {
    if (!searchInput) {
      return []
    }
    const results = domainsDataset
      .toArray()
      .reduce((acc, elem) => {
        const match = objectMatch(toObject(elem, dataset), searchInput)
        if (!match) {
          return acc
        }
        match.iri = elem.subject.value
        acc.push(match)
        return acc
      }, [])
      .sort((a, b) => {
        // Sort by similary to ensure that `Date` and `Date and Time` are ranked before
        // `TrackUpdate` and such when searching for `date`
        return compareTwoStrings(b.matched, searchInput) - compareTwoStrings(a.matched, searchInput)
      })

    return results
  }
}

export function usedOnClasses (iri, dataset) {
  const result = dataset
    .match(rdf.namedNode(iri), termIRI.domain)
    .toArray()
    .filter(({ object }) => dataset.match(object, termIRI.a, termIRI.Class).toArray().length)
  return result
}

export function rangeOf (iri, dataset) {
  const result = dataset
    .match(rdf.namedNode(iri), termIRI.range)
    .toArray()
    .map(({ object }) => object)
    .filter(n => n.value)
  return result
}
/**
 * Checks if a quad matches the search string
 * @param QuadExt The quad that might match
 * @param searchInput The search string
 * @returns {*}
 */
function objectMatch (object, searchInput, detailed = false) {
  const labelMatch = stringMatch(object.label, searchInput)
  const commentMatch = stringMatch(object.comment, searchInput)

  if (!labelMatch && !commentMatch) {
    return null
  }

  if (labelMatch) {
    const index = Math.min(
      labelMatch.index,
      labelMatch.index - 1,
      labelMatch.index - 2
    )
    object.matched = object.label.substring(index, searchInput.length + 3)
  }
  else if (commentMatch) {
    const index = Math.min(
      commentMatch.index,
      commentMatch.index - 1,
      commentMatch.index - 2
    )
    object.matched = object.comment.substring(index, searchInput.length + 3)
  }

  if (detailed) {
    return {
      object,
      match: labelMatch || commentMatch
    }
  }

  return object
}

/**
 * Searches for searchInput in potentialMatch
 * @param String potentialMatch
 * @param String searchInput
 * @returns {*}
 */
function stringMatch (potentialMatch, searchInput) {
  if (!potentialMatch) {
    return null
  }

  const index = potentialMatch.toLowerCase().indexOf(searchInput.toLowerCase())

  if (index === -1) {
    return null
  }

  return {
    index,
    input: potentialMatch,
    source: searchInput
  }
}

// TODO: labelQuadForIRI and commentQuadForIRI should be auto generated from termIRI
export function labelQuadForIRI (dataset, iri) {
  const matches = dataset.match(iri ? rdf.namedNode(iri) : null, termIRI.label, null).toArray()
  if (matches.length) {
    return matches[0]
  }
  return { object: { value: '' } }
}

export function commentQuadForIRI (dataset, iri) {
  const matches = dataset.match(iri ? rdf.namedNode(iri) : null, termIRI.comment, null).toArray()
  if (matches.length) {
    return matches[0]
  }
  return { object: { value: '' } }
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

export function rebaseIRI (iri, relative = false) {
  if (typeof iri !== 'string') {
    throw new Error(`rebaseIRI() excepts a string, not a '${typeof iri}'`)
  }
  if (iri.startsWith(datasetBaseUrl)) {
    if (datasetBaseUrl.endsWith('/')) {
      return iri.replace(datasetBaseUrl, '/')
    }
    return iri.replace(datasetBaseUrl, '')
  }
  return iri
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
    if (first.hasOwnProperty('subject') && first.hasOwnProperty('predicate') && first.hasOwnProperty('object')) {
      return first
    }
    return first.value
  }
  return ''
}

export function externalIRIToQuad (iri) {
  const range = rdf.quad(
    rdf.namedNode(iri),
    termIRI.label,
    rdf.literal(term(iri))
  )
  return range
}

export function mergedEditedOntology (_originalIRI, _newIRI, baseDataset, newDataset) {
  const originalIRI = rdf.namedNode(_originalIRI)
  const newIRI = rdf.namedNode(_newIRI)
  baseDataset = baseDataset.clone()

  newDataset.forEach(({ subject, predicate, object, graph }) => {
    if (baseDataset.match(originalIRI, predicate, null).length === 1) {
      baseDataset.removeMatches(originalIRI, predicate, null)
    }
    if (baseDataset.match(null, predicate, originalIRI).length === 1) {
      baseDataset.removeMatches(null, predicate, originalIRI)
    }
  })

  const out = baseDataset.merge(newDataset).map(({ subject, predicate, object, graph }) => {
    const quad = rdf.quad(subject, predicate, object, graph)
    if (subject.equals(originalIRI)) {
      quad.subject = newIRI
    }
    if (object.equals(originalIRI)) {
      quad.object = newIRI
    }
    if (predicate.equals(originalIRI)) {
      quad.predicate = newIRI
    }
    return quad
  })

  return out
}
