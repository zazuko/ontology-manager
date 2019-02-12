import { LOAD } from '@/store/action-types'
import currentPublicConfig from '@/apollo/queries/currentPublicConfig'

export const state = () => ({
  version: NaN,
  editor: {},
  ontology: {}
})

export const getters = {
  version: (state) => state.version,
  editor: (state) => state.editor,
  ontology: (state) => state.ontology,
}

export const mutations = {
  [LOAD] (state, config) {
    state.version = config.version
    state.editor = config.editor
    state.ontology = config.ontology
  }
}

export const actions = {
  async [LOAD] ({ commit, state }) {
    try {
      const result = await this.app.apolloProvider.defaultClient.query({ query: currentPublicConfig })
      const config = result.data.currentPublicConfig

      commit(LOAD, config)
      return Promise.resolve(config)
    }
    catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }
}
