import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { classBaseUrl } from '@/trifid/trifid.config.json'
import { termIRI, datasetToCanonicalN3, normalizeLabel, firstVal } from '@/libs/rdf'
import { toDataset as propToDataset } from '@/models/Property'

export function Class ({
  baseIRI = classBaseUrl,
  motivation = '',
  threadId = null,
  iri = false,
  label = '',
  comment = '',
  description = '',
  example = '',
  domains = [],
  parentStructureIRI = '',
  propChildren = [],
  collapsed = false,
  isNew = false,
  isDraft = true
} = {}) {
  this.proposalType = 'Class'
  this.isDraft = isDraft

  this.baseIRI = baseIRI
  this.motivation = motivation

  this.threadId = threadId

  this.iri = iri || this.baseIRI + normalizeLabel(label, 'pascal')

  this.label = label
  this.comment = comment
  this.description = description
  this.example = example
  this.domains = domains

  this.parentStructureIRI = parentStructureIRI
  this.propChildren = propChildren

  this.collapsed = collapsed
  this.isNew = isNew
  return this
}

export function validate (clss) {
  if (!clss.baseIRI) {
    throw new Error('Class `baseIRI` missing')
  }

  if (!clss.label) {
    throw new Error('Class `label` missing')
  }

  if (!/^([A-Z])/.test(clss.label)) {
    throw new Error('Class `label` should start with an uppercase letter')
  }

  if (!clss.comment) {
    throw new Error('Class `comment` missing')
  }
}

export function hydrate ({ ontology, structure }, iri) {
  const iriNode = rdf.namedNode(iri)
  const parent = structure.match(null, null, iriNode).toArray()
  const parentStructureIRI = parent.length ? parent[0].subject.value : ''

  const labelQuad = firstVal(ontology.match(iriNode, termIRI.label).toArray())
  const commentQuad = firstVal(ontology.match(iriNode, termIRI.comment).toArray())
  const descriptionQuad = firstVal(ontology.match(iriNode, termIRI.description).toArray())
  const exampleQuad = firstVal(ontology.match(iriNode, termIRI.example).toArray())

  const data = {
    proposalType: 'Class',
    isDraft: true,
    motivation: '',
    iri,
    label: labelQuad ? labelQuad.object.value : '',
    comment: commentQuad ? commentQuad.object.value : '',
    description: descriptionQuad ? descriptionQuad.object.value : '',
    example: exampleQuad ? exampleQuad.object.value : '',
    domains: ontology.match(null, termIRI.domain, iriNode).toArray().map(hydrateDomain),
    parentStructureIRI,
    propChildren: [],
    collapsed: false,
    isNew: false
  }
  const clss = new Class(data)
  return clss

  function hydrateDomain (quad) {
    const quads = ontology.match(quad.subject)
    const domainQuad = firstVal(quads.match(quad.subject, termIRI.a, termIRI.Property).toArray())
    const commentQuad = firstVal(quads.match(quad.subject, termIRI.comment).toArray())
    const labelQuad = firstVal(quads.match(quad.subject, termIRI.label).toArray())
    return {
      iri: quad.subject.value,
      matched: '',
      label: labelQuad ? labelQuad.object.value : '',
      comment: commentQuad ? commentQuad.object.value : '',
      domain: domainQuad
    }
  }
}

export function generateClassProposal (data) {
  const ontology = data.ontology
  const structure = data.structure
  const clss = data.clss
  const datasets = toDataset(clss)

  return {
    ontologyContent: toNT(ontology, datasets.ontology),
    structureContent: toNT(structure, datasets.structure)
  }
}

export function toDataset (clss, validation = true) {
  if (validation) {
    validate(clss)
  }

  const iri = rdf.namedNode(clss.iri)
  const quads = [
    rdf.quad(iri, termIRI.a, termIRI.Class),
    rdf.quad(iri, termIRI.label, rdf.literal(clss.label)),
    rdf.quad(iri, termIRI.comment, rdf.literal(clss.comment))
  ]

  if (clss.description) {
    quads.push(rdf.quad(iri, termIRI.description, rdf.literal(clss.description)))
  }
  if (clss.example) {
    quads.push(rdf.quad(iri, termIRI.example, rdf.literal(clss.example)))
  }

  if (clss.domains.length) {
    const existingDomainsQuads = clss.domains.reduce((xs, domain) => {
      let subject
      if (domain instanceof QuadExt) {
        subject = domain.subject
      }
      else {
        subject = rdf.namedNode(domain.iri)
      }
      xs.push(rdf.quad(subject, termIRI.domain, iri))
      return xs
    }, [])
    quads.push(...existingDomainsQuads)
  }

  const structureQuads = [
    rdf.quad(rdf.namedNode(clss.parentStructureIRI), termIRI.hasPart, iri)
  ]

  return clss.propChildren.reduce((acc, propChild) => {
    const childDatasets = propToDataset(propChild, validation)
    return {
      ontology: acc.ontology.merge(childDatasets.ontology),
      structure: acc.structure.merge(childDatasets.structure)
    }
  }, { ontology: rdf.dataset().addAll(quads), structure: rdf.dataset().addAll(structureQuads) })
}

export function toNT (baseDataset, newQuadsDataset) {
  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).merge(newQuadsDataset)

  return datasetToCanonicalN3(dataset)
}
