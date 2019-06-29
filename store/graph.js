import _get from 'lodash/get'
import rdf from 'rdf-ext'
import DatasetExt from 'rdf-ext/lib/Dataset'
import N3Parser from 'rdf-parser-n3'
import { Readable } from 'readable-stream'
import { serialize } from '@/libs/utils'
import { DESERIALIZE, RELOAD_DATASET, COUNT_PROPOSALS } from '@/store/action-types'
import fetchDataset from '@/trifid/dataset-fetch-client'
import countProposals from '@/apollo/queries/countProposals'

export const state = () => ({
  ontology: {},
  structure: {},
  ontologySerialized: '',
  structureSerialized: '',
  structureTree: {},
  proposalCountByIRI: {},
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
  structureTree: (state) => state.structureTree,
  clientReady: (state) => state.clientReady
}

export const mutations = {
  ontologyInit (state, ontologyDataset) {
    state.ontologySerialized = serialize(ontologyDataset)
    state.ontology = ontologyDataset
  },
  structureInit (state, structureDataset) {
    state.structureSerialized = serialize(structureDataset)
    state.structure = structureDataset
    state.structureTree = this.$buildTree(structureDataset, state.ontology, state.proposalCountByIRI)
  },
  clientReady (state) {
    state.searchIndex = this.$buildSearchIndex(state.ontology.merge(state.structure))
    state.clientReady = true
  },
  proposalCountByIRI (state, count) {
    state.proposalCountByIRI = count
  },
  rebuildStructureTree (state) {
    state.structureTree = this.$buildTree(state.structure, state.ontology, state.proposalCountByIRI)
  }
}

export const actions = {
  async [DESERIALIZE] ({ commit, dispatch, state }) {
    await dispatch(COUNT_PROPOSALS)
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

  async [RELOAD_DATASET] ({ commit, dispatch, state, rootState }) {
    const cache = JSON.stringify(state.proposalCountByIRI)
    await dispatch(COUNT_PROPOSALS)
    const compare = JSON.stringify(state.proposalCountByIRI)
    if (compare !== cache) {
      commit('rebuildStructureTree')
    }

    try {
      const { ontologyDataset, structureDataset } = await fetchDataset(rootState.config)
      if (state.ontologySerialized !== serialize(ontologyDataset) || state.structureSerialized !== serialize(structureDataset)) {
        commit('ontologyInit', ontologyDataset)
        commit('structureInit', structureDataset)
      }
      return dispatch(DESERIALIZE)
    }
    catch (err) {
      //
    }
  },

  async [COUNT_PROPOSALS] ({ commit }) {
    if (process.server) {
      return
    }
    try {
      const result = await this.app.apolloProvider.defaultClient.query({
        query: countProposals
      })
      const proposals = _get(result, 'data.proposals.proposals', [])
      const count = proposals.reduce((acc, { iri }) => {
        if (!acc[iri]) {
          acc[iri] = 0
        }
        acc[iri]++
        return acc
      }, {})
      commit('proposalCountByIRI', count)
    }
    catch (err) {
      console.error(`graph/COUNT_PROPOSALS: ${err.message}`)
    }
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
