import NamedNode from '@rdfjs/data-model/lib/named-node'
import Literal from '@rdfjs/data-model/lib/literal'
import rdf from 'rdf-ext'
import { compareTwoStrings } from 'string-similarity'

import SerializerNtriples from '@rdfjs/serializer-ntriples'
import { propertyBaseUrl, classBaseUrl } from '@/trifid/trifid.config.json'

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

export class Property {
  constructor () {
    this.baseIRI = propertyBaseUrl
    this.motivation = ''
    this.name = ''             // IRI
    this.shortDescription = '' // label
    this.longDescription = ''  // comment
    this.type = ''             // range
    this.domains = []          // domainIncludes
    this.parentStructureIRI = ''
  }

  validate () {
    if (!this.name) {
      throw new Error('Property `name` missing')
    }

    if (!/^([a-z])/.test(this.name)) {
      throw new Error("Property 'name' should start with a lowercase letter")
    }

    if (!this.shortDescription) {
      throw new Error("Property 'shortDescription' missing")
    }

    if (this.type) {
      if (!(this.type instanceof NamedNode)) {
        throw new Error(`Type '${this.type}' should be a rdf.namedNode`)
      }
    }

    if (this.domains.length) {
      this.domains.forEach((domain) => {
        if (!(domain instanceof NamedNode)) {
          throw new Error(`Class '${domain}' should be a rdf.namedNode`)
        }
      })
    }
  }

  get quads () {
    this.validate()
    const iri = rdf.namedNode(this.baseIRI + this.name)
    const quads = [
      rdf.quad(iri, termIRI.a, termIRI.Property),
      rdf.quad(iri, termIRI.label, rdf.literal(this.shortDescription)),
      rdf.quad(iri, termIRI.comment, rdf.literal(this.longDescription))
    ]

    if (this.type) {
      quads.push(rdf.quad(iri, termIRI.range, this.type))
    }

    if (this.domains.length) {
      quads.push(
        ...this.domains
          .map((domain) => rdf.quad(iri, termIRI.domain, domain))
      )
    }

    return quads
  }

  toNT (_dataset) {
    const serializerNtriples = new SerializerNtriples()
    const dataset = (_dataset ? _dataset.clone() : rdf.dataset()).addAll(this.quads)
    const stream = dataset.toStream()
    const output = serializerNtriples.import(stream)

    return new Promise((resolve) => {
      const outputLines = []
      output.on('data', (ntriples) => {
        outputLines.push(ntriples.toString())
      })
      output.on('end', () => {
        resolve(outputLines.join(''))
      })
    })
  }
}

export class Cls {
  constructor () {
    this.baseIRI = classBaseUrl
    this.motivation = ''
    this.name = ''             // IRI
    this.shortDescription = '' // label
    this.longDescription = ''  // comment
    this.domains = []          // domainIncludes
  }

  validate () {
    if (!this.name) {
      throw new Error('Property `name` missing')
    }

    if (!/^([A-Z])/.test(this.name)) {
      throw new Error("Property 'name' should start with an uppercase letter")
    }

    if (!this.shortDescription) {
      throw new Error("Property 'shortDescription' missing")
    }

    if (this.domains.length) {
      this.domains.forEach((domain) => {
        if (!(domain instanceof NamedNode)) {
          throw new Error(`Class '${domain}' should be a rdf.namedNode`)
        }
      })
    }
  }

  get quads () {
    this.validate()
    const iri = rdf.namedNode(this.baseIRI + this.name)
    const quads = [
      rdf.quad(iri, termIRI.a, termIRI.Property),
      rdf.quad(iri, termIRI.label, rdf.literal(this.shortDescription)),
      rdf.quad(iri, termIRI.comment, rdf.literal(this.longDescription))
    ]

    if (this.domains.length) {
      quads.push(
        ...this.domains
          .map((domain) => rdf.quad(domain, termIRI.domain, iri))
      )
    }

    return quads
  }

  toNT (_dataset) {
    const serializerNtriples = new SerializerNtriples()
    const dataset = (_dataset ? _dataset.clone() : rdf.dataset()).addAll(this.quads)
    const stream = dataset.toStream()
    const output = serializerNtriples.import(stream)

    return new Promise((resolve) => {
      const outputLines = []
      output.on('data', (ntriples) => {
        outputLines.push(ntriples.toString())
      })
      output.on('end', () => {
        resolve(outputLines.join(''))
      })
    })
  }

  toStructureNT (_dataset) {
    const parentIRI = rdf.namedNode(this.parentStructureIRI)
    const iri = rdf.namedNode(this.baseIRI + this.name)
    const quad = rdf.quad(parentIRI, termIRI.hasPart, iri)

    const serializerNtriples = new SerializerNtriples()
    const dataset = (_dataset ? _dataset.clone() : rdf.dataset()).add(quad)
    const stream = dataset.toStream()
    const output = serializerNtriples.import(stream)

    return new Promise((resolve) => {
      const outputLines = []
      output.on('data', (ntriples) => {
        outputLines.push(ntriples.toString())
      })
      output.on('end', () => {
        resolve(outputLines.join(''))
      })
    })
  }
}

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
