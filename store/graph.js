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
  ontology: rdf.dataset(),
  structure: rdf.dataset(),
  ontologySerialized: '',
  structureSerialized: '',
  schemaTree: [],
  structureTree: [],
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
  schemaTree: (state) => state.schemaTree,
  structureTree: (state) => state.structureTree,
  clientReady: (state) => state.clientReady
}

export const mutations = {
  ontologyInit (state, ontologyDataset) {
    state.ontologySerialized = serialize(ontologyDataset)
    state.ontology = ontologyDataset
    state.schemaTree = this.$buildSchemaTree(ontologyDataset)
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
    state.schemaTree = this.$buildSchemaTree(state.ontology)
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
    await dispatch(COUNT_PROPOSALS)
    commit('rebuildStructureTree')

    try {
      const { ontologyDataset, structureDataset } = await fetchDataset(rootState.config)
      if (state.ontologySerialized !== serialize(ontologyDataset) || state.structureSerialized !== serialize(structureDataset)) {
        commit('ontologyInit', ontologyDataset)
        commit('structureInit', structureDataset)
        commit('rebuildStructureTree')
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
      const count = proposals.reduce((acc, { iri, originalIri, isEdit, proposalObject }) => {
        const proposalType = proposalObject[proposalObject[0].proposalType]

        if (proposalType === 'Class' && isEdit) {
          iri = originalIri
        }
        if (!acc[iri]) {
          acc[iri] = {
            newClass: 0,
            newProperty: 0,
            changeClass: 0,
            changeProperty: 0
          }
        }

        if (proposalType === 'Property') {
          if (isEdit) {
            acc[iri].changeProperty++
          }
          else {
            acc[iri].newProperty++
          }
        }
        else if (proposalType === 'Class') {
          if (isEdit) {
            acc[iri].changeClass++
          }
          else {
            acc[iri].newClass++
          }
        }
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
