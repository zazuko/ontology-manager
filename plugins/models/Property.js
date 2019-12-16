import rdf from 'rdf-ext'
import QuadExt from 'rdf-ext/lib/Quad'
import Resource from './Resource'
import { bumpVersion, firstVal, datasetToCanonicalN3, normalizeLabel } from '@/libs/utils'

export default ({ app, store }, inject) => {
  class Property extends Resource {
    constructor (args = {}) {
      super(args)

      const {
        baseIRI = store.state.config.ontology.propertyBaseUrl,
        iri = '',
        ranges = [],
        // ranges removed from this Property, only used when editing a Property
        rangesRemoved = [], // Array<string iri>
        equivalentProperty = [],
        // equivalentProperty removed from this Property, only used when editing a Property
        equivalentPropertyRemoved = [], // Array<string iri>
        subProperty = '',
        // subProperty removed from this Class, only used when editing a Class
        subPropertyRemoved = [], // Array<string iri>
        // Class to which this Property belongs
        classChildren = [] // Array<Quad|Class>
      } = args

      this.proposalType = 'Property'
      this.rdfType = app.$termIRI.Property

      this.baseIRI = baseIRI
      this.iri = iri || this.baseIRI + normalizeLabel(this.label, 'camel')

      this.equivalentProperty = equivalentProperty
      this.equivalentPropertyRemoved = equivalentPropertyRemoved

      this.subProperty = subProperty
      this.subPropertyRemoved = subPropertyRemoved

      this.ranges = ranges
      this.rangesRemoved = rangesRemoved

      this.classChildren = classChildren
    }

    validate () {
      super.validate()
    }

    proposalDataset (validation = true) {
      // proposalDataset only contains changed/newer quads, things to remove
      // from the ontology (e.g. when editing a class to delete a property) need to
      // be handled later
      if (validation) {
        this.validate()
      }

      const propertyIRI = rdf.namedNode(this.iri)
      const quads = [
        rdf.quad(propertyIRI, app.$termIRI.a, this.rdfType),
        rdf.quad(propertyIRI, app.$termIRI.label, rdf.literal(this.label)),
        rdf.quad(propertyIRI, app.$termIRI.comment, rdf.literal(this.comment))
      ]

      if (this.description) {
        quads.push(rdf.quad(propertyIRI, app.$termIRI.description, rdf.literal(this.description, app.$termIRI.markdown)))
      }
      if (this.example) {
        quads.push(rdf.quad(propertyIRI, app.$termIRI.example, rdf.literal(this.example)))
      }

      if (this.isDeprecated) {
        quads.push(rdf.quad(propertyIRI, app.$termIRI.deprecated, rdf.literal('true', rdf.namedNode('xsd:boolean'))))
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
          xs.push(rdf.quad(propertyIRI, app.$termIRI.range, rangeIRI))
          return xs
        }, [])
        quads.push(...existingRangesQuads)
      }

      if (this.equivalentProperty.length) {
        const existingEquivalentPropertyQuads = this.equivalentProperty.reduce((xs, equivalentProperty) => {
          let equivalentPropertyIRI
          if (equivalentProperty instanceof QuadExt) {
            equivalentPropertyIRI = equivalentProperty.subject
          }
          else {
            equivalentPropertyIRI = rdf.namedNode(equivalentProperty.iri)
          }
          xs.push(rdf.quad(propertyIRI, app.$termIRI.equivalentProperty, equivalentPropertyIRI))
          return xs
        }, [])
        quads.push(...existingEquivalentPropertyQuads)
      }

      if (this.subProperty) {
        quads.push(
          rdf.quad(propertyIRI, app.$termIRI.subPropertyOf, this.subProperty.subject)
        )
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
          xs.push(rdf.quad(propertyIRI, app.$termIRI.domain, domainIRI))
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
        datasets.ontology = app.$mergedEditedOntology(this.originalIRI, this.iri, ontology, datasets.ontology)
        datasets.structure = app.$mergedEditedOntology(this.originalIRI, this.iri, structure, datasets.structure)

        this.domainsRemoved.forEach((iri) => {
          datasets.ontology.removeMatches(rdf.namedNode(this.iri), app.$termIRI.domain, rdf.namedNode(iri))
        })

        this.rangesRemoved.forEach((iri) => {
          datasets.ontology.removeMatches(rdf.namedNode(this.iri), app.$termIRI.range, rdf.namedNode(iri))
        })

        this.equivalentPropertyRemoved.forEach((iri) => {
          datasets.ontology.removeMatches(rdf.namedNode(this.iri), app.$termIRI.equivalentProperty, rdf.namedNode(iri))
        })

        this.subPropertyRemoved.forEach((iri) => {
          datasets.ontology.removeMatches(rdf.namedNode(this.iri), app.$termIRI.subPropertyOf, rdf.namedNode(iri))
        })

        bumpVersion(datasets.structure)

        return {
          ontologyContent: datasetToCanonicalN3(datasets.ontology),
          structureContent: datasetToCanonicalN3(datasets.structure)
        }
      }

      bumpVersion(datasets.structure)

      return {
        ontologyContent: datasetToCanonicalN3(ontology.merge(datasets.ontology)),
        structureContent: datasetToCanonicalN3(structure.merge(datasets.structure))
      }
    }

    static hydrate ({ ontology, structure }, iri) {
      const existingPropertyIRI = rdf.namedNode(iri)
      const parent = structure.match(null, null, existingPropertyIRI).toArray()
      const parentStructureIRI = parent.length ? parent[0].subject.value : ''

      const labelQuad = firstVal(ontology.match(existingPropertyIRI, app.$termIRI.label).toArray())
      const commentQuad = firstVal(ontology.match(existingPropertyIRI, app.$termIRI.comment).toArray())
      const descriptionQuad = firstVal(ontology.match(existingPropertyIRI, app.$termIRI.description).toArray())
      const exampleQuad = firstVal(ontology.match(existingPropertyIRI, app.$termIRI.example).toArray())

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
        domains: ontology.match(existingPropertyIRI, app.$termIRI.domain, null).toArray().map(hydrateDomain),
        ranges: ontology.match(existingPropertyIRI, app.$termIRI.range, null).toArray().map(hydrateRange),
        equivalentProperty: ontology.match(existingPropertyIRI, app.$termIRI.equivalentProperty, null).toArray().map(hydrateEquivalentProperty),
        subProperty: firstVal(ontology.match(existingPropertyIRI, app.$termIRI.subPropertyOf, null).toArray().map(hydrateSubProperty)),
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
        const labelQuad = firstVal(ontology.match(quad.object, app.$termIRI.label).toArray())
        return labelQuad
      }

      function hydrateRange (quad) {
        const labelQuad = ontology.match(quad.object, app.$termIRI.label).toArray()
        if (labelQuad.length) {
          return firstVal(labelQuad)
        }

        // otherwise it's an external IRI
        return app.$externalIRIToQuad(quad.object.value)
      }

      function hydrateEquivalentProperty (quad) {
        const labelQuad = ontology.match(quad.object, app.$termIRI.label).toArray()
        if (labelQuad.length) {
          return firstVal(labelQuad)
        }

        // otherwise it's an external IRI
        return app.$externalIRIToQuad(quad.object.value)
      }

      function hydrateSubProperty (quad) {
        const labelQuad = ontology.match(quad.object, app.$termIRI.label).toArray()
        if (labelQuad.length) {
          return firstVal(labelQuad)
        }

        // otherwise it's an external IRI
        return app.$externalIRIToQuad(quad.object.value)
      }
    }
  }

  inject('Property', Property)
}
