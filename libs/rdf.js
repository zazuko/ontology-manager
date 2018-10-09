import NamedNode from '@rdfjs/data-model/lib/named-node'
import rdf from 'rdf-ext'

const stringIRI = {
  a: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',

  Property: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property',
  Class: 'http://www.w3.org/2000/01/rdf-schema#Class',

  label: 'http://www.w3.org/2000/01/rdf-schema#label',
  comment: 'http://www.w3.org/2000/01/rdf-schema#comment',

  domain: 'http://schema.org/domainIncludes',
  range: 'http://schema.org/rangeIncludes',

  types: {
    string: 'http://www.w3.org/2001/XMLSchema#string',
    boolean: 'http://www.w3.org/2001/XMLSchema#boolean',
    float: 'http://www.w3.org/2001/XMLSchema#float',
    integer: 'http://www.w3.org/2001/XMLSchema#integer',
    long: 'http://www.w3.org/2001/XMLSchema#long',
    double: 'http://www.w3.org/2001/XMLSchema#double',
    decimal: 'http://www.w3.org/2001/XMLSchema#decimal',
    nonPositiveInteger: 'http://www.w3.org/2001/XMLSchema#nonPositiveInteger',
    nonNegativeInteger: 'http://www.w3.org/2001/XMLSchema#nonNegativeInteger',
    negativeInteger: 'http://www.w3.org/2001/XMLSchema#negativeInteger',
    int: 'http://www.w3.org/2001/XMLSchema#int',
    unsignedLong: 'http://www.w3.org/2001/XMLSchema#unsignedLong',
    positiveInteger: 'http://www.w3.org/2001/XMLSchema#positiveInteger',
    short: 'http://www.w3.org/2001/XMLSchema#short',
    unsignedInt: 'http://www.w3.org/2001/XMLSchema#unsignedInt',
    byte: 'http://www.w3.org/2001/XMLSchema#byte',
    unsignedShort: 'http://www.w3.org/2001/XMLSchema#unsignedShort',
    unsignedByte: 'http://www.w3.org/2001/XMLSchema#unsignedByte',
    date: 'http://www.w3.org/2001/XMLSchema#date',
    time: 'http://www.w3.org/2001/XMLSchema#time',
    dateTime: 'http://www.w3.org/2001/XMLSchema#dateTime'
  }
}

const termIRI = Object
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
    this.baseIRI = 'http://example.com/'
    this.motivation = ''
    this.name = ''             // IRI
    this.shortDescription = '' // label
    this.longDescription = ''  // comment
    this.type = ''             // range
    this.domains = []          // domainIncludes
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

    if (!this.longDescription) {
      throw new Error("Property 'longDescription' missing")
    }

    if (this.type) {
      if (!termIRI.types.hasOwnProperty(this.type)) {
        if (!(this.type instanceof NamedNode)) {
          throw new Error(`Unknown xsd type '${this.type}'`)
        }
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

  toQuads () {
    this.validate()
    const iri = rdf.namedNode(this.baseIRI + this.name)
    const quads = [
      rdf.quad(iri, termIRI.a, termIRI.Property),
      rdf.quad(iri, termIRI.label, rdf.literal(this.shortDescription)),
      rdf.quad(iri, termIRI.comment, rdf.literal(this.longDescription))
    ]

    if (this.type) {
      console.warn({type: this.type})
      if (this.type instanceof NamedNode) {
        quads.push(rdf.quad(iri, termIRI.range, this.type))
      } else {
        quads.push(rdf.quad(iri, termIRI.range, termIRI.types[this.type]))
      }
    }

    if (this.domains.length) {
      // quads.push(
      //   ...this.domains
      //     .map((domain) => rdf.quad(iri, termIRI.domain, domain))
      // )
      quads.push(...this.domains)
    }

    return quads
  }
}

function toObject (domain, dataset) {
  let label = dataset.match(domain.subject, termIRI.label).toArray()
  if (Array.isArray(label)) {
    if (label.length) label = label[0].object.value
    else label = ''
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

export function domainsSearchFactory (dataset) {
  const domainsDataset = dataset
    .match(null, termIRI.a, termIRI.Class)
    .addAll(xsdTypes)

  return (searchInput = '') => {
    if (!searchInput) return []
    let results = domainsDataset
      .toArray()
      .map(schemaClass => objectMatch(toObject(schemaClass, dataset), searchInput))
      .filter(Boolean)

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
  const match = stringMatch(object.label, searchInput) || stringMatch(object.description, searchInput)

  if (!match) {
    return null
  }

  if (detailed) {
    return {
      object,
      match
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
