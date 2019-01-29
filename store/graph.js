import rdf from 'rdf-ext'
import DatasetExt from 'rdf-ext/lib/Dataset'
import N3Parser from 'rdf-parser-n3'
import { Readable } from 'readable-stream'
// import resourcesToGraph from 'rdf-utils-dataset/resourcesToGraph'
import { serialize, buildTree } from '@/libs/utils'
import { buildSearchIndex } from '@/libs/rdf'
import { DESERIALIZE, RELOAD_DATASET } from '@/store/action-types'
import fetchDataset from '@/trifid/dataset-fetch'

export const state = () => ({
  ontology: {},
  structure: {},
  ontologySerialized: '',
  structureSerialized: '',
  ontologyGraph: {},
  structureGraph: {},
  structureTree: {},
  searchIndex: [],
  clientReady: false
})

export const getters = {
  ontology: (state) => {
    if (!(state.ontology instanceof DatasetExt)) {
      return rdf.dataset()
    }
    return state.ontology.clone()
  },
  structure: (state) => {
    if (!(state.structure instanceof DatasetExt)) {
      return rdf.dataset()
    }
    return state.structure.clone()
  },
  ontologyGraph: (state) => {
    if (!(state.ontologyGraph instanceof DatasetExt)) {
      return rdf.dataset()
    }
    return state.ontologyGraph.clone()
  },
  structureGraph: (state) => state.structureGraph,
  structureTree: (state) => state.structureTree,
  clientReady: (state) => state.clientReady
}

export const mutations = {
  ontologyInit (state, ontologyDataset) {
    state.ontologySerialized = serialize(ontologyDataset)
    state.ontology = ontologyDataset
    // state.ontologyGraph = resourcesToGraph(ontologyDataset)
  },
  structureInit (state, structureDataset) {
    state.structureSerialized = serialize(structureDataset)
    state.structure = structureDataset
    // state.structureGraph = resourcesToGraph(structureDataset)
    state.structureTree = buildTree(structureDataset, state.ontology)
  },
  clientReady (state) {
    state.searchIndex = buildSearchIndex(state.ontology.merge(state.structure))
    state.clientReady = true
  }
}

export const actions = {
  async [DESERIALIZE] ({ commit, state }) {
    const toDeserialize = ['ontology', 'structure']
      .filter((prop) => !(state[prop] instanceof DatasetExt))

    const deserialized = await Promise.all(
      toDeserialize.map((prop) => deserialize(state[`${prop}Serialized`]))
    )

    toDeserialize.forEach((prop, i) => {
      commit(`${prop}Init`, deserialized[i])
    })
    commit('clientReady')
    return Promise.resolve('deserialized')
  },
  async [RELOAD_DATASET] ({ commit, dispatch }) {
    const { ontologyDataset, structureDataset } = await fetchDataset()
    commit('ontologyInit', ontologyDataset)
    commit('structureInit', structureDataset)
    return dispatch(DESERIALIZE)
  }
}

async function deserialize (string) {
  const parser = new N3Parser({ factory: rdf })

  const input = new Readable({
    read: () => {
      input.push(string)
      input.push(null)
    }
  })

  const quadStream = parser.import(input)

  return rdf.dataset().import(quadStream)
}
