import { LOAD_CONFIG } from '@/store/action-types'
import currentPublicConfig from '@/apollo/queries/currentPublicConfig'

export const state = () => ({
  version: NaN,
  editor: {},
  ontology: {}
})

export const getters = {
  version: (state) => state.version,
  editor: (state) => state.editor,
  ontology: (state) => state.ontology
}

export const mutations = {
  [LOAD_CONFIG] (state, config) {
    state.version = config.version
    state.editor = config.editor
    state.ontology = config.ontology
  }
}

export const actions = {
  async [LOAD_CONFIG] ({ commit, state }) {
    try {
      const result = await this.app.apolloProvider.defaultClient.query({ query: currentPublicConfig })
      const config = result.data.currentPublicConfig

      commit(LOAD_CONFIG, config)
      return Promise.resolve(config)
    }
    catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }
}
