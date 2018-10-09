import NamedNode from '@rdfjs/data-model/lib/named-node'
import rdf from 'rdf-ext'

export const stringIRI = {
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

export const termIRI = Object
  .entries(stringIRI)
  .reduce((acc, [key, val]) => {
    acc[key] = rdf.namedNode(val)
    return acc
  }, {})

export class Property {
  constructor () {
    this.baseIRI = 'http://example.com/'
    this.motivation = ''
    this.name = ''             // IRI
    this.shortDescription = '' // label
    this.longDescription = ''  // comment
    this.type = ''             // range
    this.classes = []          // domainIncludes
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

    if (this.classes.length) {
      this.classes.forEach((cls) => {
        if (!(cls instanceof NamedNode)) {
          throw new Error(`Class '${cls}' should be a rdf.namedNode`)
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
      if (this.type.value) {
        quads.push(rdf.quad(iri, termIRI.range, this.type))
      } else {
        quads.push(rdf.quad(iri, termIRI.range, termIRI.types[this.type]))
      }
    }

    if (this.classes.length) {
      quads.push(
        ...this.classes
          .map((cls) => rdf.quad(iri, termIRI.domain, cls))
      )
    }

    return quads
  }
}
