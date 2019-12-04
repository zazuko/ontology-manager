import { compareTwoStrings } from '@/libs/string-similarity'
import rdf from 'rdf-ext'
import Literal from '@rdfjs/data-model/lib/literal'
import { term } from '@/libs/utils'

export default ({ app, store }, inject) => {
  const stringIRI = {
    get a () {
      return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
    },

    get Property () {
      return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Property'
    },
    get Class () {
      return 'http://www.w3.org/2000/01/rdf-schema#Class'
    },
    get Datatype () {
      return 'http://www.w3.org/2000/01/rdf-schema#Datatype'
    },

    get label () {
      return 'http://www.w3.org/2000/01/rdf-schema#label'
    },
    // short description
    get comment () {
      return 'http://www.w3.org/2000/01/rdf-schema#comment'
    },
    // long description
    get description () {
      return 'http://www.w3.org/2004/02/skos/core#note'
    },
    get example () {
      return 'http://www.w3.org/2004/02/skos/core#example'
    },

    get domain () {
      return 'http://schema.org/domainIncludes'
    },
    get range () {
      return 'http://schema.org/rangeIncludes'
    },

    get subClassOf () {
      return 'http://www.w3.org/2000/01/rdf-schema#subClassOf'
    },
    get equivalentProperty () {
      return 'http://www.w3.org/2002/07/owl#equivalentProperty'
    },
    get hasPart () {
      return store.state.config.ontology.containersNestingPredicate
    },
    get creativeWork () {
      return 'http://schema.org/CreativeWork'
    },

    get html () {
      return 'http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML'
    },
    get markdown () {
      return 'http://media-type.described.at/text/markdown'
    },

    // not used atm
    get created () {
      return 'http://purl.org/dc/terms/created'
    },
    get modified () {
      return 'http://purl.org/dc/terms/modified'
    },
    get deprecated () {
      return 'http://www.w3.org/2002/07/owl#deprecated'
    }
  }

  const termIRI = Object
    .entries(stringIRI)
    .reduce((acc, [key, val]) => {
      acc[key] = rdf.namedNode(val)
      return acc
    }, {})
  termIRI.ClassLikes = [stringIRI.Class, stringIRI.Datatype]
  termIRI.PropertyLikes = [stringIRI.Property]

  inject('termIRI', termIRI)
  inject('getTerm', getTerm)
  inject('domainsSearchFactory', domainsSearchFactory)
  inject('usedOnClasses', usedOnClasses)
  inject('rangeOf', rangeOf)
  inject('labelQuadForIRI', labelQuadForIRI)
  inject('commentQuadForIRI', commentQuadForIRI)
  inject('rebaseIRI', rebaseIRI)
  inject('externalIRIToQuad', externalIRIToQuad)
  inject('mergedEditedOntology', mergedEditedOntology)
  inject('buildSearchIndex', buildSearchIndex)
  inject('buildTree', buildTree)
  inject('findClassProperties', findClassProperties)
  inject('unPrefix', unPrefix)

  const createExternalType = ([iri, label]) =>
    rdf.quad(rdf.namedNode(iri), termIRI.label, rdf.literal(label))

  const prefixes = [{
    prefix: 'http://www.w3.org/2001/XMLSchema#',
    short: 'xsd:'
  }, {
    prefix: 'http://www.w3.org/2000/01/rdf-schema#',
    short: 'rdfs:'
  }]

  const allExternalTypes = [
    ['http://www.w3.org/2000/01/rdf-schema#literal', 'rdfs:literal'],
    ['http://www.w3.org/2001/XMLSchema#boolean', 'xsd:boolean'],
    ['http://www.w3.org/2001/XMLSchema#date', 'xsd:date'],
    ['http://www.w3.org/2001/XMLSchema#dateTime', 'xsd:dateTime'],
    ['http://www.w3.org/2001/XMLSchema#double', 'xsd:double'],
    ['http://www.w3.org/2001/XMLSchema#decimal', 'xsd:decimal'],
    ['http://www.w3.org/2001/XMLSchema#int', 'xsd:int'],
    ['http://www.w3.org/2001/XMLSchema#string', 'xsd:string'],
    ['http://www.w3.org/2001/XMLSchema#time', 'xsd:time']
  ]
  const externalTypes = allExternalTypes.map(createExternalType)

  function unPrefix (iri) {
    const found = prefixes.find(p => iri.startsWith(p.prefix))
    if (found) {
      return iri.replace(new RegExp(`^${found.prefix}`), found.short)
    }
    return iri
  }

  function toObject (domain, dataset) {
    let label = dataset.match(domain.subject, termIRI.label).toArray()
    if (Array.isArray(label)) {
      if (label.length) {
        label = label[0].object.value
      }
      else {
        label = ''
      }
    }
    if (!label && domain.object instanceof Literal) {
      label = domain.object.value
    }

    let comment = dataset.match(domain.subject, termIRI.comment).toArray()
    if (Array.isArray(comment)) {
      if (comment.length) {
        comment = comment[0].object.value
      }
      else {
        comment = ''
      }
    }

    return {
      domain,
      label,
      comment
    }
  }

  function domainsSearchFactory (dataset, resultType, includeExternalTypes = false) {
    if (!['Class', 'Property'].includes(resultType)) {
      throw new Error(`Cannot search for unknown type '${resultType}'`)
    }

    const domainsDataset = dataset
      .match(null, termIRI.a, termIRI[resultType])

    if (includeExternalTypes) {
      domainsDataset.addAll(externalTypes)
    }

    return (searchInput = '') => {
      if (!searchInput) {
        return []
      }
      const results = domainsDataset
        .toArray()
        .reduce((acc, elem) => {
          const match = objectMatch(toObject(elem, dataset), searchInput)
          if (!match) {
            return acc
          }
          match.iri = elem.subject.value
          acc.push(match)
          return acc
        }, [])
        .sort((a, b) => {
          // Sort by similary to ensure that `Date` and `Date and Time` are ranked before
          // `TrackUpdate` and such when searching for `date`
          return compareTwoStrings(b.matched, searchInput) - compareTwoStrings(a.matched, searchInput)
        })

      return results
    }
  }

  function usedOnClasses (iri, dataset) {
    const result = dataset
      .match(rdf.namedNode(iri), termIRI.domain)
      .toArray()
      .filter(({ object }) => dataset.match(object, termIRI.a, termIRI.Class).toArray().length)
    return result
  }

  function rangeOf (iri, dataset) {
    const result = dataset
      .match(rdf.namedNode(iri), termIRI.range)
      .toArray()
      .map(({ object }) => object)
      .filter(n => n.value)
    return result
  }
  /**
   * Checks if a quad matches the search string
   * @param QuadExt The quad that might match
   * @param searchInput The search string
   * @returns {*}
   */
  function objectMatch (object, searchInput, detailed = false) {
    const labelMatch = stringMatch(object.label, searchInput)
    const commentMatch = stringMatch(object.comment, searchInput)

    if (!labelMatch && !commentMatch) {
      return null
    }

    if (labelMatch) {
      const index = Math.min(
        labelMatch.index,
        labelMatch.index - 1,
        labelMatch.index - 2
      )
      object.matched = object.label.substring(index, searchInput.length + 3)
    }
    else if (commentMatch) {
      const index = Math.min(
        commentMatch.index,
        commentMatch.index - 1,
        commentMatch.index - 2
      )
      object.matched = object.comment.substring(index, searchInput.length + 3)
    }

    if (detailed) {
      return {
        object,
        match: labelMatch || commentMatch
      }
    }

    return object
  }

  /**
   * Searches for searchInput in potentialMatch
   * @param String potentialMatch
   * @param String searchInput
   * @returns {*}
   */
  function stringMatch (potentialMatch, searchInput) {
    if (!potentialMatch) {
      return null
    }

    const index = potentialMatch.toLowerCase().indexOf(searchInput.toLowerCase())

    if (index === -1) {
      return null
    }

    return {
      index,
      input: potentialMatch,
      source: searchInput
    }
  }

  function labelQuadForIRI (dataset, iri) {
    const matches = dataset.match(iri ? rdf.namedNode(iri) : null, termIRI.label, null).toArray()
    if (matches.length) {
      return matches[0]
    }
    return { object: { value: '' } }
  }

  function rebaseIRI (iri, relative = false) {
    if (typeof iri !== 'string') {
      throw new Error(`rebaseIRI() excepts a string, not a '${typeof iri}'`)
    }
    if (iri.startsWith(store.state.config.ontology.datasetBaseUrl)) {
      if (store.state.config.ontology.datasetBaseUrl.endsWith('/')) {
        return iri.replace(store.state.config.ontology.datasetBaseUrl, '/')
      }
      return iri.replace(store.state.config.ontology.datasetBaseUrl, '')
    }
    return iri
  }

  function commentQuadForIRI (dataset, iri) {
    const matches = dataset.match(iri ? rdf.namedNode(iri) : null, termIRI.comment, null).toArray()
    if (matches.length) {
      return matches[0]
    }
    return { object: { value: '' } }
  }

  function externalIRIToQuad (iri) {
    const range = rdf.quad(
      rdf.namedNode(iri),
      termIRI.label,
      rdf.literal(unPrefix(iri))
    )
    return range
  }

  function mergedEditedOntology (_originalIRI, _newIRI, baseDataset, newDataset) {
    const originalIRI = rdf.namedNode(_originalIRI)
    const newIRI = rdf.namedNode(_newIRI)
    baseDataset = baseDataset.clone()

    newDataset.forEach(({ subject, predicate, object, graph }) => {
      if (baseDataset.match(originalIRI, predicate, null).length === 1) {
        baseDataset.removeMatches(originalIRI, predicate, null)
      }
      if (baseDataset.match(null, predicate, originalIRI).length === 1) {
        baseDataset.removeMatches(null, predicate, originalIRI)
      }
    })

    const out = baseDataset.merge(newDataset).map(({ subject, predicate, object, graph }) => {
      const quad = rdf.quad(subject, predicate, object, graph)
      if (subject.equals(originalIRI)) {
        quad.subject = newIRI
      }
      if (object.equals(originalIRI)) {
        quad.object = newIRI
      }
      if (predicate.equals(originalIRI)) {
        quad.predicate = newIRI
      }
      return quad
    })

    return out
  }

  function buildSearchIndex (dataset) {
    const indexedPredicates = [stringIRI.label, stringIRI.comment, stringIRI.description]

    const indexObject = dataset.toArray().reduce((iris, quad) => {
      if (!indexedPredicates.includes(quad.predicate.value)) {
        return iris
      }
      const iri = quad.subject.value
      if (!iri.startsWith(store.state.config.ontology.datasetBaseUrl)) {
        return iris
      }
      const typeQuad = dataset.match(rdf.namedNode(iri), termIRI.a).toArray()[0]
      let type = typeQuad ? term(typeQuad.object) : ''
      if (type === 'CreativeWork') {
        type = 'Pouch'
      }

      iris[iri] = iris[iri] || {}

      Object.assign(iris[iri], {
        iri,
        type,
        part: iri.substr(iri.lastIndexOf('/') + 1),
        [term(quad.predicate)]: term(quad.object)
      })

      return iris
    }, {})
    return Object.values(indexObject)
  }

  function buildTree (structureDataset, ontologyDataset, proposalCountByIRI) {
    if (!structureDataset) {
      return {}
    }

    const nodes = {}

    // we consider <parentIRI> <givenPredicate> <childIRI>
    ;[stringIRI.hasPart].forEach((predicate) => {
      structureDataset
        .match(null, rdf.namedNode(predicate))
        .toArray()
        .forEach((quad) => {
          const parent = nodes[quad.subject.value] || (nodes[quad.subject.value] = new Node(quad.subject.value, undefined, structureDataset.match(quad.subject)))
          const child = nodes[quad.object.value] || (nodes[quad.object.value] = new Node(quad.object.value, parent, structureDataset.match(quad.object)))
          child.parent = parent
          parent.children.push(child)
        })
    })

    const modifiedDataset = structureDataset.merge(ontologyDataset).match(null, termIRI.modified)
    const baseProposalCount = {
      newClass: 0,
      newProperty: 0,
      changeClass: 0,
      changeProperty: 0
    }
    const mergeProposalCounts = (a, b) => {
      a.newClass += b.newClass
      a.newProperty += b.newProperty
      a.changeClass += b.changeClass
      a.changeProperty += b.changeProperty
    }

    const forest = Object.keys(nodes)
      .reduce((acc, iri) => {
        const node = nodes[iri]
        node.path = `/${iri.replace(store.state.config.ontology.datasetBaseUrl, '')}`
        node.properties = []
        node.type = 'container'

        const modified = modifiedDataset.match(rdf.namedNode(iri), termIRI.modified).toArray()
        node.modified = modified.length ? modified[0].object.value : ''

        node.label = iri
        let label = structureDataset.match(rdf.namedNode(iri), termIRI.label).toArray()
        if (label.length) {
          node.label = label[0].object.value
        }
        else {
          label = ontologyDataset.match(rdf.namedNode(iri), termIRI.label).toArray()
          if (label.length) {
            node.type = 'class'
            node.label = label[0].object.value
            node.properties = findClassProperties(iri, ontologyDataset)
          }
        }

        if (typeof node.proposalCount !== 'object') {
          node.proposalCount = Object.assign({}, baseProposalCount)
        }
        const count = proposalCountByIRI[iri]
        node.proposalCount = count || Object.assign({}, baseProposalCount)

        let countNode = node.parent
        while (countNode) {
          if (typeof countNode.proposalCount !== 'object') {
            countNode.proposalCount = Object.assign({}, baseProposalCount)
          }
          if (node.proposalCount) {
            mergeProposalCounts(countNode.proposalCount, node.proposalCount)
          }
          countNode = countNode.parent
        }

        if (!node.parent) {
          // then it's a root
          acc.push(node)
        }
        node.parent = null
        return acc
      }, [])

    return forest
  }

  class Node {
    constructor (iri, parent, quads, children = []) {
      this.iri = iri
      this.parent = parent
      this.quads = quads
      this.children = children
      this.isCreativeWork = !!quads.match(
        rdf.namedNode(this.iri),
        termIRI.a,
        termIRI.creativeWork
      ).length
    }
  }

  function findClassProperties (classIRI, dataset) {
    const type = termIRI.a
    const object = termIRI.Property

    const domain = termIRI.domain
    const classToSearchFor = rdf.namedNode(classIRI)

    return dataset
      .match(null, domain, classToSearchFor)
      .filter(({ subject }) => dataset.match(subject, type, object).toArray().length)
  }

  // export function _debugNT (baseDataset, newQuadsDataset) {
  //   const base = baseDataset ? baseDataset.clone() : rdf.dataset()
  //   const dataset = base.merge(newQuadsDataset)
  //
  //   return datasetToCanonicalN3(dataset)
  // }
  function getTerm (t) {
    if (typeof t === 'object') {
      return term(t.value)
    }
    return term(t)
  }
}
