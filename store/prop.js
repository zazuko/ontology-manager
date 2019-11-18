import * as VueDeepSet from 'vue-deepset'
import _get from 'lodash/get'
import gql from 'graphql-tag'
import rdf from 'rdf-ext'

import proposalById from '@/apollo/queries/proposalById'

import { SAVE, SUBMIT, NEW, LOAD } from '@/store/action-types'
import { SET_ID, ERROR, SUCCESS } from '@/store/mutation-types'

export const state = () => ({
  prop: null,
  error: false,
  success: false
})

export const getters = {
  error: (state) => state.error,
  success: (state) => state.success,
  dataset: (state) => {
    if (state.prop) {
      if (typeof state.prop.proposalDataset === 'function') {
        return state.prop.proposalDataset(false)
      }
    }
    return rdf.dataset()
  }
}

export const mutations = VueDeepSet.extendMutation({
  [ERROR] (state, error) {
    state.error = error
    state.success = false
  },
  [SUCCESS] (state, externalId) {
    state.error = false
    state.success = externalId
  },
  [SET_ID] (state, threadId) {
    state.prop.threadId = threadId
  },
  [NEW] (state) {
    state.prop = new this.$Property()
    state.error = false
    state.success = false
  },
  [LOAD] (state, prop) {
    state.prop = prop
  }
})

export const actions = {
  async [LOAD] ({ commit, state }, id) {
    try {
      const result = await this.app.apolloProvider.defaultClient.query({
        query: proposalById,
        variables: {
          id
        }
      })

      const proposal = result.data.proposal
      if (!_get(proposal, 'proposalObject')) {
        throw new Error('Not found')
      }
      const deserialized = this.$proposalDeserializer(proposal.proposalObject)

      commit(LOAD, deserialized)
      commit(SET_ID, proposal.id)
      return proposal.isDraft
    }
    catch (error) {
      throw error
    }
  },
  async [SAVE] ({ dispatch, commit, state }) {
    try {
      const threadId = state.prop.threadId
      const mutationParam = threadId ? '$id: Int!, ' : ''
      const threadInput = threadId ? 'id: $id,' : ''
      const isEdit = state.prop.isEdit

      const mutation = gql`
        mutation (${mutationParam}$headline: String!, $body: String!, $iri: String!, $proposalObject: JSON!, $threadType: ThreadType!, $isEdit: Boolean!) {
          upsertThread (input: {
            thread: {
              ${threadInput}
              headline: $headline,
              body: $body,
              iri: $iri,
              proposalObject: $proposalObject,
              threadType: $threadType,
              isEdit: $isEdit
            }
          }) {
            thread {
              id
            }
          }
        }
      `

      const variables = {
        iri: state.prop.parentStructureIRI,
        body: state.prop.motivation,
        proposalObject: JSON.parse(this.$proposalSerializer(state.prop)),
        headline: `${isEdit ? 'Change' : 'New'} property '${state.prop.label}'`,
        threadType: 'PROPOSAL',
        isEdit
      }

      if (threadId) {
        variables['id'] = threadId
      }
      const result = await this.app.apolloProvider.defaultClient.mutate({
        mutation,
        variables
      })
      if (!threadId) {
        // this means that the UPSERT did an INSERT and not an UPDATE
        dispatch('drafts/LOAD', null, { root: true })
      }

      const threadIdFromResult = _get(result, 'data.upsertThread.thread.id')

      commit(SET_ID, threadIdFromResult)
      return Promise.resolve(threadIdFromResult)
    }
    catch (error) {
      console.error(error)
      commit(ERROR, error.message)
      return Promise.reject(error)
    }
  },

  async [SUBMIT] ({ dispatch, commit, state, rootState }, token) {
    try {
      const propertyProposalData = state.prop.generateProposal({
        ontology: rootState.graph.ontology,
        structure: rootState.graph.structure
      })
      const isEdit = state.prop.isEdit

      const id = await this.$submitProposal({
        threadId: state.prop.threadId,
        object: state.prop,
        message: `${isEdit ? 'update' : 'add'} property '${state.prop.label}' to '${state.prop.parentStructureIRI}'`,
        ontologyContent: propertyProposalData.ontologyContent,
        structureContent: propertyProposalData.structureContent,
        token
      })

      commit(SUCCESS, id)
    }
    catch (error) {
      console.error(error)
      commit(ERROR, error.message)
    }
  },

  async APPROVE ({ dispatch, commit, state, rootState }, { threadId, token }) {
    await dispatch(LOAD, threadId)
    try {
      const propertyProposalData = state.prop.generateProposal({
        ontology: rootState.graph.ontology,
        structure: rootState.graph.structure
      })
      const isEdit = state.prop.isEdit

      const id = await this.$approveProposal({
        threadId: state.prop.threadId,
        object: state.prop,
        message: `${isEdit ? 'update' : 'add'} property '${state.prop.label}' to '${state.prop.parentStructureIRI}'`,
        ontologyContent: propertyProposalData.ontologyContent,
        structureContent: propertyProposalData.structureContent,
        token
      })

      commit(SUCCESS, id)
    }
    catch (error) {
      console.error(error)
      commit(ERROR, error.message)
    }
  },

  [NEW] ({ commit }) {
    commit(NEW)
  }
}
