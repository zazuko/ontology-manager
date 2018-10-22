import { Property, generatePropertyProposal } from '@/models/Property'
import { getField, updateField, createHelpers } from 'vuex-map-fields'

import { createPropertyProposal } from '@/libs/proposals'

import { SUBMIT, NEW } from '@/store/action-types'
import { ERROR, SUCCESS } from '@/store/mutation-types'

export const actions = {
  async [SUBMIT] ({ commit, state }) {
    try {
      const propertyProposalData = await generatePropertyProposal({
        ontology: typeof window !== 'undefined' ? window.ontology : {},
        property: state.property
      })

      const id = await createPropertyProposal({
        property: state.property,
        ontologyFileContent: propertyProposalData,
        token: 'token'
      })

      commit(SUCCESS, id)
    } catch (error) {
      commit(ERROR, error.message)
    }
  },

  [NEW] ({ commit }) {
    commit(NEW)
  }
}

export const getters = {
  getField
}

export const mutations = {
  [NEW] (state) {
    state.property = new Property()
  },
  [ERROR] (state, error) {
    state.error = error
    state.success = false
  },
  [SUCCESS] (state, id) {
    state.error = false
    state.success = id
  },
  updateField
}

export const state = () => ({
  error: false,
  success: false,
  property: {}
})

export const { mapMultiRowFields: mapDomainsMultiRowFields } = createHelpers({
  getterType: 'domains/getField',
  mutationType: 'domains/updateField'
})

export const { mapMultiRowFields: mapRangesMultiRowFields } = createHelpers({
  getterType: 'ranges/getField',
  mutationType: 'ranges/updateField'
})
