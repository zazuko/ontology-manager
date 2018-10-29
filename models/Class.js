import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { classBaseUrl } from '@/trifid/trifid.config.json'
import { termIRI, datasetToCanonicalN3, normalizeLabel } from '@/libs/rdf'
import { toDataset as propToDataset } from '@/models/Property'

export function Class (label = 'My Class') {
  this.baseIRI = classBaseUrl
  this.motivation = ''

  this.iri = classBaseUrl + normalizeLabel(label, 'pascal')

  this.label = label
  this.comment = 'My nice class'
  this.description = 'This is My Class!'
  this.example = 'Look here!'
  this.domains = []

  this.parentStructureIRI = ''
  this.propChildren = []

  this.done = false
  return this
}

function validate (clss) {
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

  if (clss.domains.length) {
    clss.domains.forEach(({ domain }) => {
      if (!(domain instanceof QuadExt)) {
        throw new Error(`Class '${domain}' should be a rdf-ext QuadExt`)
      }
    })
  }
}

export function generateClassProposal (data) {
  const ontology = data.ontology
  const structure = data.structure
  const clss = data.clss
  const dataset = toDataset(clss)

  return {
    ontologyContent: toNT(ontology, dataset),
    structureContent: toStructureNT(structure, clss)
  }
}

export function toDataset (clss, validation = true) {
  if (validation) {
    validate(clss)
  }

  const iri = rdf.namedNode(clss.iri)
  const quads = [
    rdf.quad(iri, termIRI.a, termIRI.Property),
    rdf.quad(iri, termIRI.label, rdf.literal(clss.label)),
    rdf.quad(iri, termIRI.comment, rdf.literal(clss.comment))
  ]

  if (clss.domains.length) {
    const existingDomainsQuads = clss.domains.reduce((xs, domain) => {
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

  const childrenDataset = clss.propChildren.reduce((acc, propChild) => {
    const childDataset = propToDataset(propChild, validation)
    return rdf.dataset().merge(childDataset)
  }, rdf.dataset())

  return dataset.merge(childrenDataset)
}

export function toNT (baseDataset, newQuadsDataset) {
  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).merge(newQuadsDataset)

  return datasetToCanonicalN3(dataset)
}

export function toStructureNT (baseDataset, clss) {
  // TODO this doesn't create the 'structure' quads yet for propChildren and classChildren
  const parentIRI = rdf.namedNode(clss.parentStructureIRI)
  const iri = rdf.namedNode(clss.iri)
  const quad = rdf.quad(parentIRI, termIRI.hasPart, iri)

  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).add(quad)

  return datasetToCanonicalN3(dataset)
}
