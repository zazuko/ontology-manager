import { quadToNTriples } from '@rdfjs/to-ntriples'

export const state = () => ({
  ontology: {},
  structure: {},
  ontologySerialized: '',
  structureSerialized: '',
  structureTree: {}
})

export const mutations = {
  setOntology (state, dataset) {
    state.ontologySerialized = serialize(dataset)
    state.ontology = dataset
  },
  setStructure (state, dataset) {
    state.structureSerialized = serialize(dataset)
    state.structure = dataset
    state.structureTree = buildTree(dataset)
  }
}

function serialize (dataset) {
  return dataset._quads
    .map((quad) => quadToNTriples(quad))
    .join('\n')
}

function buildTree (triples) {
  if (!triples) return {}
  const tree = triples
    .toArray()
    .reduce((terms, triple) => {
      if (triple.subject.termType !== 'NamedNode') {
        return terms
      }

      try {
        const iri = triple.subject.value
        const parts = iri.split('/').slice(3).filter(Boolean)

        let parent = terms
        while (parts.length) {
          const child = parts.shift()
          const idx = parent.children.map(child => child.lvl).indexOf(child)
          if (idx === -1) {
            const path = `${(parent.path || '')}/${child}`

            parent.children.push({ iri, path, lvl: child, children: [] })
            parent = parent.children[parent.children.length - 1]
          } else {
            parent = parent.children[idx]
          }
          // give direct access to any child from its IRI accessible on the root:
          // structureTree[iri] = …
          terms[iri] = parent
        }
      } catch (err) {
        console.error(err)
      }
      return terms
    }, { children: [] })
  return tree
}
