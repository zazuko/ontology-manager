export const state = () => ({
  ontology: {},
  structure: {}
})

export const mutations = {
  setOntology (state, dataset) {
    state.ontology = dataset
  },
  setStructure (state, dataset) {
    state.structure = dataset
  }
}
