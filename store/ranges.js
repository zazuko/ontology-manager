import { getField, updateField } from 'vuex-map-fields'

import { ADD_RANGE, DELETE_RANGE } from '@/store/mutation-types'

export const mutations = {
  updateField,
  [ADD_RANGE] (state, range) {
    state.ranges.push(range)
  },
  [DELETE_RANGE] (state, index) {
    state.ranges.splice(index, 1)
  }
}

export const getters = {
  getField
}

export const state = () => ({
  ranges: []
})
