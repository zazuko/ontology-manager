export const state = () => ({})

export const mutations = {}

export const actions = {
  async nuxtServerInit (context, { req }) {
    if (req) {
      context.commit('graph/setOntology', req.ontology)
      context.commit('graph/setStructure', req.structure)
      context.commit('graph/setStructureTree', buildTree(req.structure))
    }
  }
}

function buildTree (triples) {
  const tree = triples
    .toArray()
    .reduce((terms, triple) => {
      if (triple.subject.termType !== 'NamedNode') {
        return terms
      }

      try {
        const iri = triple.subject.value
        const parts = iri.split('/').slice(3).filter(Boolean)
        const path = `/${parts.join('/')}`

        let parent = terms
        while (parts.length) {
          const child = parts.shift()
          const idx = parent.children.map(child => child.lvl).indexOf(child)
          if (idx === -1) {
            parent.children.push({ iri, path, lvl: child, children: [] })
            parent = parent.children[parent.children.length - 1]
          } else {
            parent = parent.children[idx]
          }
        }
      } catch (err) {
        console.error(err)
      }
      return terms
    }, { children: [] })
  return tree
}
