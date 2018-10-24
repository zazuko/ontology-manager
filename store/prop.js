import * as VueDeepSet from 'vue-deepset'
import _cloneDeep from 'lodash'

import { propertyBaseUrl } from '@/trifid/trifid.config.json'

import { generatePropertyProposal, toDataset } from '@/models/Property'
import { createPropertyProposal } from '@/libs/proposals'

import { SUBMIT, NEW } from '@/store/action-types'
import { ERROR, SUCCESS } from '@/store/mutation-types'

export const propBase = () => _cloneDeep({
  baseIRI: propertyBaseUrl,
  motivation: '',
  name: '',
  label: '',            // label
  comment: '',          // comment
  ranges: [],           // rangeIncludes
  domains: [],          // domainIncludes
  parentStructureIRI: '',
  classChildren: []
})

export const state = () => ({
  prop: propBase(),
  error: false,
  success: false
})

export const getters = {
  error: (state) => state.error,
  success: (state) => state.success,
  dataset: (state) => toDataset(state.prop, false)
}

export const mutations = VueDeepSet.extendMutation({
  [ERROR] (state, error) {
    state.error = error
    state.success = false
  },
  [SUCCESS] (state, id) {
    state.error = false
    state.success = id
  },
  [NEW] (state) {
    throw new Error('not implemented')
  }
})

export const actions = {
  async [SUBMIT] ({ commit, state }, token) {
    try {
      const propertyProposalData = generatePropertyProposal({
        ontology: typeof window !== 'undefined' ? window.ontology : {},
        property: state.prop
      })

      const id = await createPropertyProposal({
        property: state.prop,
        ontologyContent: propertyProposalData,
        token
      })

      commit(SUCCESS, id)
    } catch (error) {
      console.error(error)
      commit(ERROR, error.message)
    }
  },

  [NEW] ({ commit }) {
    commit(NEW)
  }
}
