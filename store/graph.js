import rdf from 'rdf-ext'
import N3Parser from 'rdf-parser-n3'
import { Readable } from 'readable-stream'
import resourcesToGraph from 'rdf-utils-dataset/resourcesToGraph'
import { serialize, buildTree } from '@/libs/utils'
import { DESERIALIZE } from '@/store/action-types'

export const state = () => ({
  ontology: {},
  structure: {},
  ontologySerialized: '',
  structureSerialized: '',
  ontologyGraph: {},
  structureGraph: {},
  structureTree: {},
  clientReady: false
})

export const getters = {
  ontology: (state) => {
    if (!(state.ontology instanceof rdf.defaults.Dataset)) {
      return rdf.dataset()
    }
    return state.ontology.clone()
  },
  structure: (state) => {
    if (!(state.structure instanceof rdf.defaults.Dataset)) {
      return rdf.dataset()
    }
    return state.structure.clone()
  },
  ontologyGraph: (state) => {
    if (!(state.ontologyGraph instanceof rdf.defaults.Dataset)) {
      return rdf.dataset()
    }
    return state.ontologyGraph.clone()
  },
  structureGraph: (state) => state.structureGraph,
  structureTree: (state) => state.structureTree,
  clientReady: (state) => state.clientReady
}

export const mutations = {
  ontologyInit (state, dataset) {
    state.ontologySerialized = serialize(dataset)
    state.ontology = dataset
    state.ontologyGraph = resourcesToGraph(dataset)
  },
  structureInit (state, dataset) {
    state.structureSerialized = serialize(dataset)
    state.structure = dataset
    state.structureGraph = resourcesToGraph(dataset)
    state.structureTree = buildTree(dataset, this.state.graph.ontology)
  },
  clientReady (state) {
    state.clientReady = true
  }
}

export const actions = {
  async [DESERIALIZE] ({ commit, state }) {
    const toDeserialize = ['ontology', 'structure']
      .filter((prop) => !(state[prop] instanceof rdf.defaults.Dataset))

    const deserialized = await Promise.all(
      toDeserialize.map((prop) => deserialize(state[`${prop}Serialized`]))
    )

    toDeserialize.forEach((prop, i) => {
      commit(`${prop}Init`, deserialized[i])
    })
    commit('clientReady')
    return Promise.resolve('deserialized')
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
  const dataset = await rdf.dataset().import(quadStream)
  return dataset
}
