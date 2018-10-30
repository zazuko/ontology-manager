import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { classBaseUrl } from '@/trifid/trifid.config.json'
import { termIRI, datasetToCanonicalN3, normalizeLabel } from '@/libs/rdf'
import { toDataset as propToDataset } from '@/models/Property'

export function Class (label = '') {
  this.baseIRI = classBaseUrl
  this.motivation = ''

  this.iri = classBaseUrl + normalizeLabel(label, 'pascal')

  this.label = label
  this.comment = ''
  this.description = ''
  this.example = ''
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
      } else {
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
