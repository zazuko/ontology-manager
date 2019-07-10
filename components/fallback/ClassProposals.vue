<template>
  <div class="tile is-vertical is-12">
    <div class="tile is-parent">
      <article class="tile is-child container-box">
        <h1 class="title">New Class Proposals</h1>

        <div
          v-show="_get(newObjectProposals, 'proposals.length')"
          class="tile is-child container-box proposal-boxes">
          <div class="content">
            <div
              v-for="(group, index) in groups"
              :key="index"
              class="tile is-ancestor object-tiles">
              <div
                v-for="(proposal, i) in group"
                :key="i"
                class="tile is-parent object-tile">
                <template v-if="proposal.proposalObject.label">
                  <pouch-box
                    :label="proposal.proposalObject.label"
                    :to="{ name: 'proposal-id', params: { id: proposal.id } }"
                    :properties-count="_get(proposal, 'proposalObject.propChildren.length', 0)"
                    :iri="proposal.proposalObject.iri"
                    :modified="proposal.updatedAt"
                    :is-proposal="true"
                    type="class" />
                </template>
              </div>
            </div>
          </div>
        </div>
        <div v-show="!_get(newObjectProposals, 'proposals.length')">
          <p>No proposal on this object at the moment.</p>
        </div>

        <div
          v-show="$auth && $auth.$state.loggedIn"
          class="layout-objects-list-tools">
          <nuxt-link
            id="proposal-new-class"
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
import newObjectProposals from '@/apollo/queries/newObjectProposalsByIri'
import PouchBox from './PouchBox'

export default {
  name: 'ClassProposals',
  props: {
    iri: {
      type: String,
      required: true
    }
  },
  mounted () {
    if (!this.$apollo.queries.newObjectProposals.loading) {
      this.$apollo.queries.newObjectProposals.refetch()
    }
  },
  components: {
    PouchBox
  },
  computed: {
    groups () {
      return arrayToGroups({ children: _get(this, 'newObjectProposals.proposals', []) })
    }
  },
  methods: {
    _get,
    arrayToGroups
  },
  apollo: {
    newObjectProposals: {
      query: newObjectProposals,
      variables () {
        return {
          iri: this.iri
        }
      },
      fetchPolicy: 'no-cache',
      pollInterval: process.server ? null : 1000 * 15,
      result ({ data, loading }) {
        if (!loading) {
          const proposals = _get(data, 'newObjectProposals.proposals', [])
          return proposals.map(proposal => {
            if (Array.isArray(proposal.proposalObject)) {
              proposal.proposalObject = this.$proposalDeserializer(proposal.proposalObject)
            }
            return proposal
          })
        }
        return []
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    }
  }
}
</script>
