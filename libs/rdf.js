import { datasetBaseUrl } from '@/trifid/trifid.config.json'
import Literal from '@rdfjs/data-model/lib/literal'
import rdf from 'rdf-ext'
import { compareTwoStrings } from 'string-similarity'

const stringIRI = {
  a: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',

  Property: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
  Class: 'http://www.w3.org/2000/01/rdf-schema#Class',

  label: 'http://www.w3.org/2000/01/rdf-schema#label',
  comment: 'http://www.w3.org/2000/01/rdf-schema#comment',

  domain: 'http://schema.org/domainIncludes',
  range: 'http://schema.org/rangeIncludes',

  hasPart: 'http://schema.org/hasPart'
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
    if (label.length) label = label[0].object.value
    else label = ''
  }
  if (!label && domain.object instanceof Literal) {
    label = domain.object.value
  }

  let comment = dataset.match(domain.subject, termIRI.comment).toArray()
  if (Array.isArray(comment)) {
    if (comment.length) comment = comment[0].object.value
    else comment = ''
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
    if (!searchInput) return []
    const results = domainsDataset
      .toArray()
      .reduce((acc, elem) => {
        const match = objectMatch(toObject(elem, dataset), searchInput)
        if (!match) {
          return acc
        }
        match.key = elem.subject.value
        acc.push(match)
        return acc
      }, [])
      .sort((a, b) => {
        // Sort by similary to ensure that `Date` and `Date and Time` are ranked before
        // `TrackUpdate` and such when searching for `date`
        return compareTwoStrings(b.matched, searchInput) - compareTwoStrings(a.matched, searchInput)
      })

    if (resultType === 'Property') {
      // For existing properties we wanna know to what Classes they apply
      // and their type/range
      return results.map((elem) => {
        const subject = elem.domain.subject
        elem.usedOn = dataset
          .match(subject, termIRI.domain)
          .toArray()
          .filter(({ object }) => dataset.match(object, termIRI.a, termIRI.Class).length)
        elem.range = dataset
          .match(subject, termIRI.range)
          .toArray()
          .reduce((str, { object }) => object.value, '')
        return elem
      })
    }

    return results
  }
}

/**
 * Checks if a quad matches the search string
 * @param QuadExt The quad that might match
 * @param searchInput The search string
 * @returns {*}
 */
function objectMatch (object, searchInput, detailed = false) {
  const labelMatch = stringMatch(object.label, searchInput)
  const descMatch = stringMatch(object.description, searchInput)

  if (!labelMatch && !descMatch) {
    return null
  }

  if (labelMatch) {
    const index = Math.min(
      labelMatch.index,
      labelMatch.index - 1,
      labelMatch.index - 2
    )
    object.matched = object.label.substring(index, searchInput.length + 3)
  } else if (descMatch) {
    const index = Math.min(
      descMatch.index,
      descMatch.index - 1,
      descMatch.index - 2
    )
    object.matched = object.description.substring(index, searchInput.length + 3)
  }

  if (detailed) {
    return {
      object,
      match: labelMatch || descMatch
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

export function labelQuadForIRI (iri, dataset) {
  const matches = dataset.match(rdf.namedNode(iri), termIRI.label).toArray()
  if (matches.length) {
    return matches[0]
  }
  return {}
}

function iri (o) {
  return o.iri ? o.iri().value : o.toString()
}

export function term (o) {
  if (!o) {
    return undefined
  }

  const oIri = iri(o)

  return (oIri.match(new RegExp('[^/^#]+(?=$)')) || [])[0]
}

export function rebaseIRI (iri) {
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
    .join('\n')
}
