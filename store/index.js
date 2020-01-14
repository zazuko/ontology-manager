import * as VueDeepSet from 'vue-deepset'

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
    if (process.server) {
      const Cookies = require('cookies')
      const cookieJar = new Cookies(req, res)
      const token = cookieJar.get('zom_token')
      await this.app.$apolloHelpers.onLogin(token)
    }
    await dispatch('config/LOAD_CONFIG')
    commit('class/NEW')
    commit('prop/NEW')
    await dispatch('graph/RELOAD_DATASET')

    if (req && req.ontology) {
      commit('graph/ontologyInit', req.ontology)
    }
    if (req && req.structure) {
      commit('graph/structureInit', req.structure)
    }
  },
  async nuxtClientInit ({ commit, dispatch }, context) {
    commit('class/NEW')
    commit('prop/NEW')
    await dispatch('graph/DESERIALIZE')
  }
}
