import userDrafts from '@/apollo/queries/userDrafts'

import { LOAD } from '@/store/action-types'

export const state = () => ({
  drafts: []
})

export const getters = {
  drafts: (state) => state.drafts
}

export const mutations = {
  [LOAD] (state, drafts) {
    state.drafts = drafts
  }
}

export const actions = {
  async [LOAD] ({ commit, state }) {
    const personId = this.$auth.$storage.getState('personId')
    if (!personId) {
      return state.drafts
    }
    try {
      const result = await this.app.apolloProvider.defaultClient.query({
        query: userDrafts,
        variables: {
          authorId: personId
        },
        fetchPolicy: 'no-cache'
      })

      const drafts = result.data.proposals.drafts

      commit(LOAD, drafts)
      return Promise.resolve(drafts)
    }
    catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }
}
