import * as VueDeepSet from 'vue-deepset'

export const state = () => ({})

export const mutations = VueDeepSet.extendMutation()

export const actions = {
  // Note: this gets called during SSR, which is
  // a. why we have access to `req`
  // b. why it will be broken client-side: data will be (de)serialized to/from JSON for the client
  async nuxtServerInit (store, { req, res }) {
    if (req && req.ontology) {
      store.commit('graph/ontologyInit', req.ontology)
    }
    if (req && req.structure) {
      store.commit('graph/structureInit', req.structure)
    }
  },
  async nuxtClientInit ({ dispatch }, context) {
    await dispatch('graph/DESERIALIZE')
    console.log('nuxtClientInit done!')
  }
}
