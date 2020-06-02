import * as VueDeepSet from 'vue-deepset'
import _get from 'lodash/get'
import gql from 'graphql-tag'
import rdf from 'rdf-ext'
import { bumpVersion } from '@/libs/utils'

import proposalById from '@/apollo/queries/proposalById'

import { APPROVE, LOAD, EDIT, NEW, SAVE, SUBMIT } from '@/store/action-types'
import { SET_ID, ERROR, SUCCESS } from '@/store/mutation-types'

export const state = () => ({
  clss: null,
  error: false,
  success: false
})

export const getters = {
  error: (state) => state.error,
  success: (state) => state.success,
  dataset: (state) => {
    if (state.clss) {
      if (typeof state.clss.proposalDataset === 'function') {
        return state.clss.proposalDataset(false)
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
  [SUCCESS] (state, id) {
    state.error = false
    state.success = id
  },
  [SET_ID] (state, threadId) {
    state.clss.threadId = threadId
  },
  [NEW] (state) {
    state.clss = new this.$Class()
    state.error = false
    state.success = false
  },
  [LOAD] (state, clss) {
    state.clss = clss
  },
  [EDIT] (state) {
    state.clss.isDraft = true
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
      const deserialized = this.$proposalDeserializer(proposal.proposalObject)

      commit(LOAD, deserialized)
      commit(SET_ID, proposal.id)
      return Promise.resolve(proposal.isDraft)
    }
    catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  },

  async [SAVE] ({ dispatch, commit, state }) {
    try {
      const threadId = state.clss.threadId
      const mutationParam = threadId ? '$id: Int!, ' : ''
      const threadInput = threadId ? 'id: $id,' : ''
      const isEdit = state.clss.isEdit

      const mutation = gql`
        mutation (${mutationParam}$headline: String!, $body: String!, $iri: String!, $proposalObject: JSON!, $threadType: ThreadType!, $isEdit: Boolean!, $originalIRI: String) {
          upsertThread (input: {
            thread: {
              ${threadInput}
              headline: $headline,
              body: $body,
              iri: $iri,
              proposalObject: $proposalObject,
              threadType: $threadType,
              isEdit: $isEdit,
              originalIri: $originalIRI
            }
          }) {
            thread {
              id
            }
          }
        }
      `

      const variables = {
        iri: state.clss.parentStructureIRI,
        body: state.clss.motivation,
        proposalObject: JSON.parse(this.$proposalSerializer(state.clss)),
        headline: `${isEdit ? 'Change' : 'New'} class '${state.clss.label}'`,
        threadType: 'PROPOSAL',
        isEdit
      }

      if (threadId) {
        variables.id = threadId
      }
      if (state.clss.originalIRI) {
        variables.originalIRI = state.clss.originalIRI
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
      const classProposalData = state.clss.generateProposal({
        ontology: rootState.graph.ontology,
        structure: rootState.graph.structure
      })
      const isEdit = state.clss.isEdit

      const id = await this.$submitProposal({
        threadId: state.clss.threadId,
        object: state.clss,
        message: `${isEdit ? 'update' : 'add'} class '${state.clss.label}'`,
        ontologyContent: classProposalData.ontologyContent,
        structureContent: classProposalData.structureContent,
        token
      })

      commit(SUCCESS, id)
      dispatch('graph/RELOAD_DATASET', {}, { root: true })
    }
    catch (error) {
      console.error(error)
      commit(ERROR, error.message)
    }
  },

  async [EDIT] ({ commit, dispatch, state }) {
    try {
      const threadId = state.clss.threadId
      commit(EDIT)
      await dispatch(SAVE)

      const mutation = gql`
        mutation ($threadId: Int!) {
          editProposal (input: {
            threadId: $threadId
          }) {
            thread {
              id
            }
          }
        }
      `
      const variables = { threadId }
      await this.app.apolloProvider.defaultClient.mutate({
        mutation,
        variables
      })
      await dispatch(LOAD, threadId)
    }
    catch (err) {
      console.error(err)
    }
  },

  async [APPROVE] ({ dispatch, commit, state, rootState }, { threadId, token }) {
    await dispatch(LOAD, threadId)
    try {
      const classProposalData = state.clss.generateProposal({
        ontology: rootState.graph.ontology,
        structure: bumpVersion(rootState.graph.structure)
      })
      const isEdit = state.clss.isEdit

      const id = await this.$approveProposal({
        threadId: state.clss.threadId,
        object: state.clss,
        message: `${isEdit ? 'update' : 'add'} class '${state.clss.label}' to '${state.clss.parentStructureIRI}'`,
        ontologyContent: classProposalData.ontologyContent,
        structureContent: classProposalData.structureContent,
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
