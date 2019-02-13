import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { termIRI, datasetToCanonicalN3, normalizeLabel, firstVal, mergedEditedOntology } from '@/libs/rdf'

const classBaseUrl = process.env.CLASS_BASE_URL

export default class Class {
  constructor ({
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
    isDeprecated = false,
    // domains added to this Class
    domains = [],
    // domains removed from this Class, only used when editing a Class
    domainsRemoved = [], // Array<string iri>
    // Pouch/Container to which this Class belongs
    parentStructureIRI = '',
    // properties newly added to this Class
    propChildren = [], // Array<Quad|Property>
    // true if it's a child and the box is collapsed
    isSubFormCollapsed = false,
    // true if it's a child created from a proposal
    isNew = false,
    // false if the proposal got submitted
    isDraft = true,
    // true if the proposal is editing an existing object instead of adding a new one
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
    this.isDeprecated = isDeprecated

    this.domains = domains
    this.domainsRemoved = domainsRemoved

    this.parentStructureIRI = parentStructureIRI
    this.propChildren = propChildren

    this.isSubFormCollapsed = isSubFormCollapsed
    this.isNew = isNew
    this.isEdit = isEdit
  }

  validate () {
    if (!this.baseIRI) {
      throw new Error('Class `baseIRI` missing')
    }

    if (!this.label) {
      throw new Error('Class `label` missing')
    }

    if (!/^([A-Z])/.test(this.label)) {
      throw new Error('Class `label` should start with an uppercase letter')
    }

    if (!this.comment) {
      throw new Error('Class `comment` missing')
    }
  }

  proposalDataset (validation = true) {
    // proposalDataset only contains changed/newer quads, things to remove
    // from the ontology (e.g. when editing a class to delete a property) need to
    // handled later
    if (validation) {
      this.validate()
    }

    const classIRI = rdf.namedNode(this.iri)
    const quads = [
      rdf.quad(classIRI, termIRI.a, termIRI.Class),
      rdf.quad(classIRI, termIRI.label, rdf.literal(this.label)),
      rdf.quad(classIRI, termIRI.comment, rdf.literal(this.comment))
    ]

    if (this.description) {
      quads.push(rdf.quad(classIRI, termIRI.description, rdf.literal(this.description, termIRI.markdown)))
    }
    if (this.example) {
      quads.push(rdf.quad(classIRI, termIRI.example, rdf.literal(this.example)))
    }

    if (this.isDeprecated) {
      quads.push(rdf.quad(classIRI, termIRI.deprecated, rdf.literal('true', rdf.namedNode('xsd:boolean'))))
    }

    if (this.domains.length) {
      const existingDomainsQuads = this.domains.reduce((xs, domain) => {
        let domainIRI
        if (domain instanceof QuadExt) {
          domainIRI = domain.subject
        }
        else {
          domainIRI = rdf.namedNode(domain.iri)
        }
        xs.push(rdf.quad(domainIRI, termIRI.domain, classIRI))
        return xs
      }, [])
      quads.push(...existingDomainsQuads)
    }

    const structureQuads = [
      rdf.quad(rdf.namedNode(this.parentStructureIRI), termIRI.hasPart, classIRI)
    ]

    const ontology = rdf.dataset(quads)
    const structure = rdf.dataset(structureQuads)

    return (this.propChildren || []).reduce((acc, propChild) => {
      // dubious
      const childDatasets = propChild.proposalDataset(validation)

      const ontology = acc.ontology.merge(childDatasets.ontology)
      // child classes should not become structure objects i.e. logistic objects
      // const structure = acc.structure.merge(childDatasets.structure)

      return { ontology, structure }
    }, { ontology, structure })
  }

  generateProposal (data) {
    const ontology = data.ontology
    const structure = data.structure
    const datasets = this.proposalDataset()

    if (this.isEdit && this.originalIRI) {
      datasets.ontology = mergedEditedOntology(this.originalIRI, this.iri, ontology, datasets.ontology)
      datasets.structure = mergedEditedOntology(this.originalIRI, this.iri, structure, datasets.structure)

      this.domainsRemoved.forEach(({ iri }) => {
        datasets.ontology.removeMatches(rdf.namedNode(iri), termIRI.domain, rdf.namedNode(this.iri))
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

  static hydrate ({ ontology, structure }, iri) {
    const existingClassIRI = rdf.namedNode(iri)
    const parent = structure.match(null, null, existingClassIRI).toArray()
    const parentStructureIRI = parent.length ? parent[0].subject.value : ''

    const labelQuad = firstVal(ontology.match(existingClassIRI, termIRI.label).toArray())
    const commentQuad = firstVal(ontology.match(existingClassIRI, termIRI.comment).toArray())
    const descriptionQuad = firstVal(ontology.match(existingClassIRI, termIRI.description).toArray())
    const exampleQuad = firstVal(ontology.match(existingClassIRI, termIRI.example).toArray())

    const data = {
      isEdit: true,
      isDraft: true,
      motivation: '',
      iri,
      originalIRI: iri,
      label: labelQuad ? labelQuad.object.value : '',
      comment: commentQuad ? commentQuad.object.value : '',
      description: descriptionQuad ? descriptionQuad.object.value : '',
      example: exampleQuad ? exampleQuad.object.value : '',
      domains: ontology.match(null, termIRI.domain, existingClassIRI).toArray().map(hydrateDomain),
      parentStructureIRI,
      propChildren: [],
      isSubFormCollapsed: false,
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
}
