import { LOAD_CONFIG } from '@/store/action-types'
import currentPublicConfig from '@/apollo/queries/currentPublicConfig'
import dummyConfig from '@/fixtures/dummy-config'

export const state = () => ({
  setup: false,
  version: NaN,
  editor: {},
  ontology: {}
})

export const getters = {
  setup: (state) => state.setup,
  version: (state) => state.version,
  editor: (state) => state.editor,
  ontology: (state) => state.ontology
}

export const mutations = {
  [LOAD_CONFIG] (state, config) {
    state.version = config.version
    state.editor = config.editor
    state.setup = typeof config.editor.setup === 'string' ? config.editor.setup : false
    state.ontology = config.ontology
  }
}

export const actions = {
  async [LOAD_CONFIG] ({ commit, state }) {
    let config
    try {
      const result = await this.app.apolloProvider.defaultClient.query({
        query: currentPublicConfig,
        fetchPolicy: 'no-cache'
      })
      config = result.data.currentPublicConfig
    }
    catch (error) {
      console.error(error)
    }
    if (!config) {
      config = dummyConfig()
    }
    commit(LOAD_CONFIG, config)
  }
}
