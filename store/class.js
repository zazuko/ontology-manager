import * as VueDeepSet from 'vue-deepset'
import _get from 'lodash/get'
import gql from 'graphql-tag'

import proposalById from '@/apollo/queries/proposalById'

import { Class, generateClassProposal, proposalDataset } from '@/models/Class'
import { submitProposal, proposalSerializer, proposalDeserializer } from '@/libs/proposals'

import { SAVE, SUBMIT, NEW, LOAD } from '@/store/action-types'
import { SET_ID, ERROR, SUCCESS } from '@/store/mutation-types'

export const state = () => ({
  clss: new Class(),
  error: false,
  success: false
})

export const getters = {
  error: (state) => state.error,
  success: (state) => state.success,
  dataset: (state) => proposalDataset(state.clss, false),
  serialized: (state) => proposalSerializer(state.clss)
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
    state.clss = new Class()
    state.error = false
    state.success = false
  },
  [LOAD] (state, clss) {
    state.clss = clss
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
      const deserialized = proposalDeserializer(proposal.proposalObject)

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

      const mutation = gql`
        mutation (${mutationParam}$headline: String!, $body: String!, $iri: String!, $proposalObject: JSON!, $threadType: ThreadType!) {
          upsertThread (input: {
            thread: {
              ${threadInput}
              headline: $headline,
              body: $body,
              iri: $iri,
              proposalObject: $proposalObject,
              threadType: $threadType
            }
          }) {
            thread {
              id
            }
          }
        }
      `
      const isEdit = state.clss.isEdit

      const variables = {
        iri: state.clss.parentStructureIRI,
        body: state.clss.motivation,
        proposalObject: JSON.parse(proposalSerializer(state.clss)),
        headline: `${isEdit ? 'Change' : 'New'} class '${state.clss.label}'`,
        threadType: 'PROPOSAL'
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
      return Promise.resolve()
    }
    catch (error) {
      console.error(error)
      commit(ERROR, error.message)
      return Promise.reject(error)
    }
  },

  async [SUBMIT] ({ dispatch, commit, state, rootState }, token) {
    try {
      const classProposalData = generateClassProposal({
        ontology: rootState.graph.ontology,
        structure: rootState.graph.structure,
        clss: state.clss
      })
      const isEdit = state.clss.isEdit

      const id = await submitProposal({
        threadId: state.clss.threadId,
        object: state.clss,
        title: `${isEdit ? 'Change' : 'New'} class '${state.clss.label}'`,
        message: `${isEdit ? 'update' : 'add'} class '${state.clss.label}'`,
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
