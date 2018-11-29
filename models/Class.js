import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { classBaseUrl } from '@/trifid/trifid.config.json'
import { termIRI, datasetToCanonicalN3, normalizeLabel, firstVal, mergedEditedOntology } from '@/libs/rdf'
import { proposalDataset as propToDataset } from '@/models/Property'

export function Class ({
  baseIRI = classBaseUrl,
  motivation = '',
  threadId = null,
  iri = '',
  // when editing a Class, originalIRI is the IRI that this.iri will replace
  originalIRI = '',
  label = '',
  comment = '',
  description = '',
  example = '',
  // domains added to this Class
  domains = [],
  // domains removed from this Class, only used when editing a Class
  domainsRemoved = [], // Array<string iri>
  // Pouch/Container to which this Class belgons
  parentStructureIRI = '',
  // properties newly added to this Class, either a Quad or a Property
  propChildren = [],
  // true if it's a child and the box is collapsed
  collapsed = false,
  // true if it's a child created from a proposal
  isNew = false,
  // false if the proposal got submitted
  isDraft = true,
  // true if the proposal is editing an existing object instead of not adding a new one
  isEdit = false
} = {}) {
  this.proposalType = 'Class'
  this.isDraft = isDraft

  this.baseIRI = baseIRI
  this.motivation = motivation

  this.threadId = threadId

  this.iri = iri || this.baseIRI + normalizeLabel(label, 'pascal')
  this.originalIRI = originalIRI

  this.label = label
  this.comment = comment
  this.description = description
  this.example = example
  this.domains = domains

  this.domainsRemoved = domainsRemoved

  this.parentStructureIRI = parentStructureIRI
  this.propChildren = propChildren

  this.collapsed = collapsed
  this.isNew = isNew
  this.isEdit = isEdit
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
    isEdit: true,
    isDraft: true,
    motivation: '',
    iri,
    originalIRI: iri,
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
  const datasets = proposalDataset(clss)

  if (clss.isEdit && clss.originalIRI) {
    datasets.ontology = mergedEditedOntology(clss.originalIRI, clss.iri, ontology, datasets.ontology)
    datasets.structure = mergedEditedOntology(clss.originalIRI, clss.iri, structure, datasets.structure)

    clss.domainsRemoved.forEach((iri) => {
      datasets.ontology.removeMatches(rdf.namedNode(iri), termIRI.domain, rdf.namedNode(clss.iri))
    })

    return {
      ontologyContent: datasetToCanonicalN3(datasets.ontology),
      structureContent: datasetToCanonicalN3(datasets.structure)
    }
  }

  return {
    ontologyContent: datasetToCanonicalN3(ontology.merge(datasets.ontology)),
    structureContent: datasetToCanonicalN3(structure.merge(datasets.structure))
  }
}

// proposalDataset only contains changed/newer quads, things to remove
// from the ontology (e.g. when editing a class to delete a property) need to
// handled later
export function proposalDataset (clss, validation = true) {
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

  const ontology = rdf.dataset().addAll(quads)
  const structure = rdf.dataset().addAll(structureQuads)

  return clss.propChildren.reduce((acc, propChild) => {
    const childDatasets = propToDataset(propChild, validation)

    const ontology = acc.ontology.merge(childDatasets.ontology)
    const structure = acc.structure.merge(childDatasets.structure)

    return { ontology, structure }
  }, { ontology, structure })
}

export function _debugNT (baseDataset, newQuadsDataset) {
  const base = baseDataset ? baseDataset.clone() : rdf.dataset()
  const dataset = base.merge(newQuadsDataset)

  return datasetToCanonicalN3(dataset)
}
