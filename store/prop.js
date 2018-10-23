import _cloneDeep from 'lodash'
import { propertyBaseUrl } from '@/trifid/trifid.config.json'

import { generatePropertyProposal } from '@/models/Property'
import { createPropertyProposal } from '@/libs/proposals'

import { SUBMIT, NEW } from '@/store/action-types'
import { ERROR, SUCCESS } from '@/store/mutation-types'

const propBase = () => _cloneDeep({
  baseIRI: propertyBaseUrl,
  motivation: '',
  name: '',             // IRI
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
  success: false,
})

export const mutations = {
  [ERROR] (state, error) {
    state.error = error
    state.success = false
  },
  [SUCCESS] (state, id) {
    state.error = false
    state.success = id
  }
}

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
