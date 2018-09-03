export const state = () => ({
  ontology: {},
  structure: {},
  structureTree: {}
})

export const mutations = {
  setOntology (state, dataset) {
    state.ontology = dataset
  },
  setStructure (state, dataset) {
    state.structure = dataset
  },
  setStructureTree (state, tree) {
    state.structureTree = tree
  }
}
