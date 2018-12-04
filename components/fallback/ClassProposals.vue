<template>
  <div class="tile is-vertical is-12">
    <div class="tile is-parent">
      <article class="tile is-child container-box">
        <h1 class="title">Proposals</h1>

        <div
          v-if="_get(proposals, 'proposals.length')"
          class="tile is-child container-box">
          <div class="content">
            <div class="tile is-ancestor">
              <div class="tile is-parent is-12">
                <div
                  v-for="(group, i) in arrayToGroups({ children: _get(proposals, 'proposals', []) })"
                  :key="i"
                  class="tile is-ancestor">
                  <div
                    v-for="(proposal, index) in group"
                    :key="index"
                    class="tile is-parent is-3">
                    <pouch-box
                      :label="proposal.proposalObject.label"
                      :to="{ name: 'proposal-id', params: { id: proposal.id } }"
                      :properties-count="_get(proposal, 'proposalObject.propChildren.length', 0)"
                      type="class"
                      class="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No proposal on this object at the moment.</p>
        </div>

        <div
          class="layout-objects-list-tools">
          <nuxt-link
            :to="{ name: 'proposal-class', query: { iri: iri } }"
            class="button">
            Request New Class
          </nuxt-link>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import _get from 'lodash/get'
import { arrayToGroups } from '@/libs/utils'
import proposals from '@/apollo/queries/proposalsByIri'
import { proposalDeserializer } from '@/libs/proposals'
import PouchBox from './PouchBox'

export default {
  name: 'ClassProposals',
  props: {
    iri: {
      type: String,
      required: true
    }
  },
  components: {
    PouchBox
  },
  methods: {
    _get,
    arrayToGroups
  },
  apollo: {
    proposals: {
      query: proposals,
      variables () {
        return {
          iri: this.iri
        }
      },
      fetchPolicy: 'cache-and-network',
      result ({ data, loading }) {
        if (!loading) {
          const proposals = _get(data, 'proposals.proposals', [])
          return proposals.map(proposal => {
            if (Array.isArray(proposal.proposalObject)) {
              proposal.proposalObject = proposalDeserializer(proposal.proposalObject)
            }
            return proposal
          })
        }
        return []
      }
    }
  }
}
</script>
