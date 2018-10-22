import rdf from 'rdf-ext'
import NamedNode from '@rdfjs/data-model/lib/named-node'
import SerializerNtriples from '@rdfjs/serializer-ntriples'
import { classBaseUrl } from '@/trifid/trifid.config.json'
import { termIRI } from '@/libs/rdf'

export class Class {
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

  get dataset () {
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

    return rdf.dataset().addAll(quads)
  }

  toNT (_dataset) {
    const serializerNtriples = new SerializerNtriples()
    const dataset = (_dataset ? _dataset.clone() : rdf.dataset()).merge(this.dataset)
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
