import * as VueDeepSet from 'vue-deepset'
import _get from 'lodash/get'
import gql from 'graphql-tag'

import { Class, generateClassProposal, toDataset } from '@/models/Class'
import { submitProposal, proposalSerializer } from '@/libs/proposals'

import { SAVE, SUBMIT, NEW } from '@/store/action-types'
import { SET_ID, ERROR, SUCCESS } from '@/store/mutation-types'

export const state = () => ({
  clss: new Class(),
  error: false,
  success: false
})

export const getters = {
  error: (state) => state.error,
  success: (state) => state.success,
  dataset: (state) => toDataset(state.clss, false),
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
  }
})

export const actions = {
  async [SAVE] ({ commit, state }) {
    try {
      const threadId = state.clss.threadId
      const mutationParam = threadId ? '$id: Int!, ' : ''
      const threadInput = threadId ? 'id: $id,' : ''

      const mutation = gql`
        mutation (${mutationParam}$headline: String!, $body: String!, $iri: String!, $proposalObject: JSON!, $threadType: ThreadType!, $status: Status!) {
          upsertThread (input: {
            thread: {
              ${threadInput}
              headline: $headline,
              body: $body,
              iri: $iri,
              proposalObject: $proposalObject,
              threadType: $threadType,
              status: $status
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
        proposalObject: JSON.parse(proposalSerializer(state.clss)),
        headline: `New class '${state.clss.label}'`,
        threadType: 'PROPOSAL',
        status: 'DRAFT'
      }

      if (threadId) {
        variables['id'] = threadId
      }
      const result = await this.app.apolloProvider.defaultClient.mutate({
        mutation,
        variables
      })

      const threadIdFromResult = _get(result, 'data.upsertThread.thread.id')

      commit(SET_ID, threadIdFromResult)
    } catch (error) {
      console.error(error)
      commit(ERROR, error.message)
    }
  },

  async [SUBMIT] ({ commit, state }, token) {
    try {
      const classProposalData = generateClassProposal({
        ontology: typeof window !== 'undefined' ? window.ontology : {},
        structure: typeof window !== 'undefined' ? window.structure : {},
        clss: state.clss
      })

      const id = await submitProposal({
        object: state.clss,
        title: `New class '${state.clss.label}'`,
        message: `add class '${state.clss.label}'`,
        ontologyContent: classProposalData.ontologyContent,
        structureContent: classProposalData.structureContent,
        token
      })

      commit(SUCCESS, id)
    } catch (error) {
      console.error(error)
      commit(ERROR, error.message)
    }
  },

  [NEW] ({ commit }) {
    commit(NEW)
  }
}
