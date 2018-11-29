import { propertyBaseUrl } from '@/trifid/trifid.config.json'
import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { termIRI, datasetToCanonicalN3, normalizeLabel } from '@/libs/rdf'
import { proposalDataset as classToDataset } from '@/models/Class'

export function Property ({
  baseIRI = propertyBaseUrl,
  motivation = '',
  threadId = null,
  iri = false,
  label = '',
  comment = '',
  description = '',
  example = '',
  ranges = [],
  domains = [],
  parentStructureIRI = '',
  classChildren = [],
  collapsed = false, // true if it's a child and the box is collapsed
  isNew = false,     // true if it's a child created from a proposal
  isDraft = true,    // false if the proposal got submitted
  isEdit = false     // true if the proposal is to edit an existing object, not adding a new one
} = {}) {
  this.proposalType = 'Property'
  this.isDraft = isDraft

  this.baseIRI = baseIRI
  this.motivation = motivation

  this.threadId = threadId

  this.iri = iri || this.baseIRI + normalizeLabel(label, 'camel')

  this.label = label
  this.comment = comment
  this.description = description
  this.example = example
  this.ranges = ranges
  this.domains = domains

  this.parentStructureIRI = parentStructureIRI
  this.classChildren = classChildren

  this.collapsed = collapsed
  this.isNew = isNew
  return this
}

export function validate (prop) {
  if (!prop.baseIRI) {
    throw new Error('Property `baseIRI` missing')
  }

  if (!prop.label) {
    throw new Error('Property `label` missing')
  }

  if (!prop.comment) {
    throw new Error('Property `comment` missing')
  }
}

export function generatePropertyProposal (data) {
  const ontology = data.ontology
  const structure = data.structure
  const property = data.property
  const datasets = proposalDataset(property)

  return {
    ontologyContent: toNT(ontology, datasets.ontology),
    structureContent: toNT(structure, datasets.structure)
  }
}

export function proposalDataset (property, validation = true) {
  if (validation) {
    validate(property)
  }

  const iri = rdf.namedNode(property.iri)
  const quads = [
    rdf.quad(iri, termIRI.a, termIRI.Property),
    rdf.quad(iri, termIRI.label, rdf.literal(property.label)),
    rdf.quad(iri, termIRI.comment, rdf.literal(property.comment))
  ]

  if (property.description) {
    quads.push(rdf.quad(iri, termIRI.description, rdf.literal(property.description)))
  }
  if (property.example) {
    quads.push(rdf.quad(iri, termIRI.example, rdf.literal(property.example)))
  }

  if (property.ranges.length) {
    const existingRangesQuads = property.ranges.reduce((xs, range) => {
      let subject
      if (range instanceof QuadExt) {
        subject = range.subject
      }
      else {
        subject = rdf.namedNode(range.iri)
      }
      xs.push(rdf.quad(iri, termIRI.range, subject))
      return xs
    }, [])
    quads.push(...existingRangesQuads)
  }

  if (property.domains.length) {
    const existingDomainsQuads = property.domains.reduce((xs, domain) => {
      let subject
      if (domain instanceof QuadExt) {
        subject = domain.subject
      }
      else {
        subject = rdf.namedNode(domain.iri)
      }
      xs.push(rdf.quad(iri, termIRI.domain, subject))
      return xs
    }, [])
    quads.push(...existingDomainsQuads)
  }

  return property.classChildren.reduce((acc, classChild) => {
    const childDatasets = classToDataset(classChild, validation)
    return {
      ontology: acc.ontology.merge(childDatasets.ontology),
      structure: acc.structure.merge(childDatasets.structure)
    }
  }, { ontology: rdf.dataset().addAll(quads), structure: rdf.dataset() })
}

export function toNT (baseDataset, newQuadsDataset) {
  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).merge(newQuadsDataset)

  return datasetToCanonicalN3(dataset)
}
