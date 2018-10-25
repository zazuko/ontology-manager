import { propertyBaseUrl } from '@/trifid/trifid.config.json'
import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { termIRI, datasetToCanonicalN3, normalizeLabel } from '@/libs/rdf'
import { toDataset as classToDataset } from '@/models/Class'

export function Property (label = 'my prop') {
  this.baseIRI = propertyBaseUrl
  this.motivation = ''

  this.iri = propertyBaseUrl + normalizeLabel(label, 'camel')

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

  if (!prop.label) {
    throw new Error('Property `label` missing')
  }

  if (!/^([a-z])/.test(prop.label)) {
    throw new Error(`Property 'label' ${prop.label} should start with a lowercase letter`)
  }

  if (!prop.comment) {
    throw new Error('Property `comment` missing')
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
    const existingRangesQuads = property.ranges.reduce((xs, domain) => {
      let subject
      if (domain instanceof QuadExt) {
        subject = domain.subject
      } else {
        subject = rdf.namedNode(domain.iri)
      }
      xs.push(rdf.quad(subject, termIRI.range, iri))
      return xs
    }, [])
    quads.push(...existingRangesQuads)
  }

  if (property.domains.length) {
    const existingDomainsQuads = property.domains.reduce((xs, domain) => {
      let subject
      if (domain instanceof QuadExt) {
        subject = domain.subject
      } else {
        subject = rdf.namedNode(domain.iri)
      }
      xs.push(rdf.quad(subject, termIRI.domain, iri))
      return xs
    }, [])
    quads.push(...existingDomainsQuads)
  }

  const dataset = rdf.dataset().addAll(quads)

  const childrenDataset = property.classChildren.reduce((acc, classChild) => {
    const childDataset = classToDataset(classChild, validation)
    return rdf.dataset().merge(childDataset)
  }, rdf.dataset())

  return dataset.merge(childrenDataset)
}

export function toNT (baseDataset, newQuadsDataset) {
  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).merge(newQuadsDataset)

  return datasetToCanonicalN3(dataset)
}
