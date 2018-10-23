import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import SerializerNtriples from '@rdfjs/serializer-ntriples'
import { termIRI } from '@/libs/rdf'

function validate (clss) {
  if (!clss.baseIRI) {
    throw new Error('Class `baseIRI` missing')
  }

  if (!clss.name) {
    throw new Error('Class `name` missing')
  }

  if (!/^([A-Z])/.test(clss.name)) {
    throw new Error('Class `name` should start with an uppercase letter')
  }

  if (!clss.label) {
    throw new Error('Class `label` missing')
  }

  if (clss.domains.length) {
    clss.domains.forEach((domain) => {
      if (!(domain instanceof QuadExt)) {
        throw new Error(`Class '${domain}' should be a rdf-ext QuadExt`)
      }
    })
  }
}

export async function generateClassProposal (data) {
  const ontology = data.ontology
  const structure = data.structure
  const clss = data.clss
  const dataset = toDataset(clss)
  return {
    ontologyContent: toNT(ontology, dataset),
    structureContent: toStructureNT(structure)
  }
}

export function toDataset (clss) {
  validate(clss)
  const iri = rdf.namedNode(clss.baseIRI + clss.name)
  const quads = [
    rdf.quad(iri, termIRI.a, termIRI.Property),
    rdf.quad(iri, termIRI.label, rdf.literal(clss.label)),
    rdf.quad(iri, termIRI.comment, rdf.literal(clss.comment))
  ]

  if (clss.domains.length) {
    quads.push(
      ...clss.domains
        .map(({ subject }) => rdf.quad(subject, termIRI.domain, iri))
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

async function toStructureNT (baseDataset, clss) {
  const parentIRI = rdf.namedNode(clss.parentStructureIRI)
  const iri = rdf.namedNode(clss.baseIRI + clss.name)
  const quad = rdf.quad(parentIRI, termIRI.hasPart, iri)

  const serializerNtriples = new SerializerNtriples()
  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).add(quad)
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
