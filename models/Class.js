import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { classBaseUrl } from '@/trifid/trifid.config.json'
import { termIRI, datasetToCanonicalN3 } from '@/libs/rdf'

export function Class () {
  this.baseIRI = classBaseUrl
  this.motivation = ''

  this.iri = ''

  this.label = 'My Class'
  this.comment = 'My nice class'
  this.description = 'This is My Class!'
  this.example = 'Look here!'
  this.domains = []

  this.parentStructureIRI = ''
  this.propChildren = []
  return this
}

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
      if (domain.hasOwnProperty('domain')) {
        subject = domain.domain.subject
      } else {
        subject = rdf.namedNode(domain.iri)
      }
      xs.push(rdf.quad(subject, termIRI.domain, iri))
      return xs
    }, [])
    quads.push(...existingDomainsQuads)
  }

  return rdf.dataset().addAll(quads)
}

function toNT (baseDataset, newQuadsDataset) {
  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).merge(newQuadsDataset)

  return datasetToCanonicalN3(dataset)
}

function toStructureNT (baseDataset, clss) {
  const parentIRI = rdf.namedNode(clss.parentStructureIRI)
  const iri = rdf.namedNode(clss.baseIRI + clss.name)
  const quad = rdf.quad(parentIRI, termIRI.hasPart, iri)

  const dataset = (baseDataset ? baseDataset.clone() : rdf.dataset()).add(quad)

  return datasetToCanonicalN3(dataset)
}
