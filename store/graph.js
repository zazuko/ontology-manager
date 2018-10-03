import { serialize, buildTree } from '@/libs/utils'

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
    state.structureTree = buildTree(dataset, this.state.graph.ontology)
  }
}
