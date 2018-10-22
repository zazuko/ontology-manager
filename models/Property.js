import rdf from 'rdf-ext'
import NamedNode from '@rdfjs/data-model/lib/named-node'
import SerializerNtriples from '@rdfjs/serializer-ntriples'
import { propertyBaseUrl } from '@/trifid/trifid.config.json'
import { termIRI } from '@/libs/rdf'

export class Property {
  constructor () {
    this.baseIRI = propertyBaseUrl
    this.motivation = ''
    this.name = ''             // IRI
    this.label = ''            // label
    this.comment = ''          // comment
    this.ranges = []           // rangeIncludes
    this.domains = []          // domainIncludes
    this.parentStructureIRI = ''
  }

  validate () {
    if (!this.name) {
      throw new Error('Property `name` missing')
    }

    if (!/^([a-z])/.test(this.name)) {
      throw new Error(`Property 'name' ${this.name} should start with a lowercase letter`)
    }

    if (!this.label) {
      throw new Error("Property 'label' missing")
    }

    if (this.ranges.length) {
      this.ranges.forEach((range) => {
        if (!(range instanceof NamedNode)) {
          throw new Error(`Range '${range}' should be a rdf.namedNode`)
        }
      })
    }

    if (this.domains.length) {
      this.domains.forEach((domain) => {
        if (!(domain instanceof NamedNode)) {
          throw new Error(`Domain '${domain}' should be a rdf.namedNode`)
        }
      })
    }
  }
}

export async function generatePropertyProposal (data) {
  const ontology = data.ontology
  const property = data.property
  const dataset = toDataset(property)
  return toNT(ontology, dataset)
}

function toDataset (property) {
  const iri = rdf.namedNode(property.baseIRI + property.name)
  const quads = [
    rdf.quad(iri, termIRI.a, termIRI.Property),
    rdf.quad(iri, termIRI.label, rdf.literal(property.label)),
    rdf.quad(iri, termIRI.comment, rdf.literal(property.comment))
  ]

  if (property.ranges.length) {
    quads.push(
      ...property.ranges
        .map((range) => rdf.quad(iri, termIRI.range, range))
    )
  }

  if (property.domains.length) {
    quads.push(
      ...property.domains
        .map((domain) => rdf.quad(iri, termIRI.domain, domain))
    )
  }

  return rdf.dataset().addAll(quads)
}

async function toNT (baseDataset, newQuadsDataset) {
  const serializerNtriples = new SerializerNtriples()
  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).merge(newQuadsDataset)
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
