import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import SerializerNtriples from '@rdfjs/serializer-ntriples'
import { termIRI } from '@/libs/rdf'

function validate (prop) {
  if (!prop.baseIRI) {
    throw new Error('Property `baseIRI` missing')
  }

  if (!prop.name) {
    throw new Error('Property `name` missing')
  }

  if (!/^([a-z])/.test(prop.name)) {
    throw new Error(`Property 'name' ${prop.name} should start with a lowercase letter`)
  }

  if (!prop.label) {
    throw new Error('Property `label` missing')
  }

  if (prop.ranges.length) {
    prop.ranges.forEach((range) => {
      if (!(range instanceof QuadExt)) {
        throw new Error(`Class '${range}' should be a rdf-ext QuadExt`)
      }
    })
  }

  if (prop.domains.length) {
    prop.domains.forEach((domain) => {
      if (!(domain instanceof QuadExt)) {
        throw new Error(`Class '${domain}' should be a rdf-ext QuadExt`)
      }
    })
  }
}

export async function generatePropertyProposal (data) {
  const property = data.property
  const ontology = data.ontology
  const dataset = toDataset(property)
  return toNT(ontology, dataset)
}

export function toDataset (property, validation = true) {
  if (validation) {
    validate(property)
  }

  const iri = rdf.namedNode(property.baseIRI + property.name)
  const quads = [
    rdf.quad(iri, termIRI.a, termIRI.Property),
    rdf.quad(iri, termIRI.label, rdf.literal(property.label)),
    rdf.quad(iri, termIRI.comment, rdf.literal(property.comment))
  ]

  if (property.ranges.length) {
    quads.push(
      ...property.ranges
        .map(({ subject }) => rdf.quad(iri, termIRI.range, subject))
    )
  }

  if (property.domains.length) {
    quads.push(
      ...property.domains
        .map(({ subject }) => rdf.quad(iri, termIRI.domain, subject))
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
