import { getField, updateField } from 'vuex-map-fields'

import { ADD_DOMAIN, DELETE_DOMAIN } from '@/store/mutation-types'

export const mutations = {
  updateField,
  [ADD_DOMAIN] (state, domain) {
    state.domains.push(domain)
  },
  [DELETE_DOMAIN] (state, index) {
    state.domains.splice(index, 1)
  }
}

export const getters = {
  getField
}

export const state = () => ({
  domains: []
})
