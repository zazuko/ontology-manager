import { propertyBaseUrl } from '@/trifid/trifid.config.json'
import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { termIRI, datasetToCanonicalN3 } from '@/libs/rdf'

export function Property () {
  this.baseIRI = propertyBaseUrl
  this.motivation = ''

  this.iri = ''

  this.label = 'my prop'
  this.comment = 'my property'
  this.description = 'This is My Prop!'
  this.example = 'Look here!'
  this.ranges = []
  this.domains = []

  this.parentStructureIRI = ''
  this.classChildren = []
  return this
}

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

export function generatePropertyProposal (data) {
  const property = data.property
  const ontology = data.ontology
  const dataset = toDataset(property)
  return toNT(ontology, dataset)
}

export function toDataset (property, validation = true) {
  if (validation) {
    validate(property)
  }

  const iri = rdf.namedNode(property.iri)
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

function toNT (baseDataset, newQuadsDataset) {
  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).merge(newQuadsDataset)

  return datasetToCanonicalN3(dataset)
}
