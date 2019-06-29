import * as VueDeepSet from 'vue-deepset'

// let datasetPolling = false

export const state = () => ({
  authProcessDone: false
})

export const mutations = VueDeepSet.extendMutation({
  authProcessDone (state) {
    state.authProcessDone = true
  }
})

export const actions = {
  async authProcessDone ({ commit, dispatch }) {
    commit('authProcessDone')
  },
  // Note: this gets called during SSR, which is
  // a. why we have access to `req`
  // b. why it will be broken client-side: data will be (de)serialized to/from JSON for the client
  async nuxtServerInit ({ commit, dispatch }, { req, res }) {
    await dispatch('config/LOAD_CONFIG')
    commit('class/NEW')
    commit('prop/NEW')

    if (req && req.ontology) {
      commit('graph/ontologyInit', req.ontology)
    }
    if (req && req.structure) {
      commit('graph/structureInit', req.structure)
    }
    // if (!datasetPolling && process.server) {
    //   datasetPolling = setInterval(() => {
    //     dispatch('graph/RELOAD_DATASET')
    //   }, 5000)
    // }
  },
  async nuxtClientInit ({ commit, dispatch }, context) {
    commit('class/NEW')
    commit('prop/NEW')
    await dispatch('graph/DESERIALIZE')
  }
}
