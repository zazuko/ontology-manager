import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import { termIRI, datasetToCanonicalN3, normalizeLabel, firstVal, externalIRIToQuad, mergedEditedOntology } from '@/libs/rdf'

const propertyBaseUrl = process.env.PROPERTY_BASE_URL

export default class Property {
  constructor ({
    baseIRI = propertyBaseUrl,
    motivation = '',
    threadId = null,
    iri = '',
    // when editing a Property, originalIRI is the IRI that this.iri will replace
    originalIRI = '',
    label = '',
    comment = '',
    description = '',
    example = '',
    isDeprecated = false,
    // domains added to this Property
    domains = [],
    // domains removed from this Property, only used when editing a Property
    domainsRemoved = [], // Array<string iri>
    // domains added to this Property
    ranges = [],
    // ranges removed from this Property, only used when editing a Property
    rangesRemoved = [], // Array<string iri>
    // Class to which this Property belongs
    parentStructureIRI = '',
    // classes needed by this Property proposal
    classChildren = [], // Array<Quad|Class>
    // true if it's a child and the box is collapsed
    isSubFormCollapsed = false,
    // true if it's a child created from a proposal
    isNew = false,
    // false if the proposal got submitted
    isDraft = true,
    // true if the proposal is editing an existing object instead of adding a new one
    isEdit = false
  } = {}) {
    this.proposalType = 'Property'
    this.isDraft = isDraft

    this.baseIRI = baseIRI
    this.motivation = motivation

    this.threadId = threadId

    this.iri = iri || this.baseIRI + normalizeLabel(label, 'camel')
    this.originalIRI = originalIRI

    this.label = label
    this.comment = comment
    this.description = description
    this.example = example
    this.isDeprecated = isDeprecated

    this.ranges = ranges
    this.rangesRemoved = rangesRemoved
    this.domains = domains
    this.domainsRemoved = domainsRemoved

    this.parentStructureIRI = parentStructureIRI
    this.classChildren = classChildren

    this.isSubFormCollapsed = isSubFormCollapsed
    this.isNew = isNew
    this.isEdit = isEdit
  }

  validate () {
    if (!this.baseIRI) {
      throw new Error('Property `baseIRI` missing')
    }

    if (!this.label) {
      throw new Error('Property `label` missing')
    }

    if (!this.comment) {
      throw new Error('Property `comment` missing')
    }
  }

  proposalDataset (validation = true) {
    // proposalDataset only contains changed/newer quads, things to remove
    // from the ontology (e.g. when editing a class to delete a property) need to
    // handled later
    if (validation) {
      this.validate()
    }

    const propertyIRI = rdf.namedNode(this.iri)
    const quads = [
      rdf.quad(propertyIRI, termIRI.a, termIRI.Property),
      rdf.quad(propertyIRI, termIRI.label, rdf.literal(this.label)),
      rdf.quad(propertyIRI, termIRI.comment, rdf.literal(this.comment))
    ]

    if (this.description) {
      quads.push(rdf.quad(propertyIRI, termIRI.description, rdf.literal(this.description, termIRI.markdown)))
    }
    if (this.example) {
      quads.push(rdf.quad(propertyIRI, termIRI.example, rdf.literal(this.example)))
    }

    if (this.isDeprecated) {
      quads.push(rdf.quad(propertyIRI, termIRI.deprecated, rdf.literal('true', rdf.namedNode('xsd:boolean'))))
    }

    if (this.ranges.length) {
      const existingRangesQuads = this.ranges.reduce((xs, range) => {
        let rangeIRI
        if (range instanceof QuadExt) {
          rangeIRI = range.subject
        }
        else {
          rangeIRI = rdf.namedNode(range.iri)
        }
        xs.push(rdf.quad(propertyIRI, termIRI.range, rangeIRI))
        return xs
      }, [])
      quads.push(...existingRangesQuads)
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
        xs.push(rdf.quad(propertyIRI, termIRI.domain, domainIRI))
        return xs
      }, [])
      quads.push(...existingDomainsQuads)
    }

    const ontology = rdf.dataset(quads)
    const structure = rdf.dataset()

    return (this.classChildren || []).reduce((acc, classChild) => {
      // dubious
      const childDatasets = classChild.proposalDataset(validation)

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

      this.domainsRemoved.forEach((iri) => {
        datasets.ontology.removeMatches(rdf.namedNode(this.iri), termIRI.domain, rdf.namedNode(iri))
      })

      this.rangesRemoved.forEach((iri) => {
        datasets.ontology.removeMatches(rdf.namedNode(this.iri), termIRI.range, rdf.namedNode(iri))
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
    const existingPropertyIRI = rdf.namedNode(iri)
    const parent = structure.match(null, null, existingPropertyIRI).toArray()
    const parentStructureIRI = parent.length ? parent[0].subject.value : ''

    const labelQuad = firstVal(ontology.match(existingPropertyIRI, termIRI.label).toArray())
    const commentQuad = firstVal(ontology.match(existingPropertyIRI, termIRI.comment).toArray())
    const descriptionQuad = firstVal(ontology.match(existingPropertyIRI, termIRI.description).toArray())
    const exampleQuad = firstVal(ontology.match(existingPropertyIRI, termIRI.example).toArray())

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
      domains: ontology.match(existingPropertyIRI, termIRI.domain, null).toArray().map(hydrateDomain),
      ranges: ontology.match(existingPropertyIRI, termIRI.range, null).toArray().map(hydrateRange),
      /*
      TODO: we should show the property change request on a class 'object-details'
      page for ALL CLASSES to which this property applies. We'll need to find a trick
      to achieve this. One way might be to use the property IRI as `parentStructureIRI`
      and on a class 'object-details' page iterate over all properties this class has
      and look in PG for a prop change request with this parentStructureIRI.
      */
      parentStructureIRI,
      propChildren: [],
      isSubFormCollapsed: false,
      isNew: false
    }
    const prop = new Property(data)
    return prop

    function hydrateDomain (quad) {
      const labelQuad = firstVal(ontology.match(quad.object, termIRI.label).toArray())
      return labelQuad
    }

    function hydrateRange (quad) {
      const labelQuad = ontology.match(quad.object, termIRI.label).toArray()
      if (labelQuad.length) {
        return firstVal(labelQuad)
      }

      // otherwise it's an external IRI
      return externalIRIToQuad(quad.object.value)
    }
  }
}
