import resourcesToGraph from 'rdf-utils-dataset/resourcesToGraph'
import { serialize, buildTree } from '@/libs/utils'

export const state = () => ({
  ontology: {},
  structure: {},
  ontologySerialized: '',
  structureSerialized: '',
  ontologyGraph: {},
  structureGraph: {},
  structureTree: {}
})

export const mutations = {
  setOntology (state, dataset) {
    state.ontologySerialized = serialize(dataset)
    state.ontology = dataset
    state.ontologyGraph = resourcesToGraph(dataset)
  },
  setStructure (state, dataset) {
    state.structureSerialized = serialize(dataset)
    state.structure = dataset
    state.structureGraph = resourcesToGraph(dataset)
    state.structureTree = buildTree(dataset, this.state.graph.ontology)
  }
}
