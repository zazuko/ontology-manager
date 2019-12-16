<template>
  <section class="section">
    <h2 class="title is-2">
      Proposals
      <template v-if="$auth && $auth.$state.loggedIn && isClass">
        <nuxt-link
          :to="{ name: 'proposal-property', query: { iri: iri } }"
          id="proposal-add-property"
          title="Request new property"
          class="title-edit-button">
          +
        </nuxt-link>
      </template>
    </h2>

    <p v-if="!hasProposals">
      No proposals on this object at the moment.
    </p>

    <table
      v-if="hasObjectProposals"
      class="table generic-table is-fullwidth">
      <thead>
        <tr>
          <th>
            New Property
          </th>
          <th>
            Expected&nbsp;Type
          </th>
          <th>
            Description
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="proposal in newObjectProposals.proposals"
          :key="proposal.id">
          <td>
            <nuxt-link :to="{ name: 'proposal-id', params: { id: proposal.id } }">
              {{ proposal.proposalObject.label }}
            </nuxt-link>
          </td>
          <td>
            <ul class="types-list">
              <li
                v-for="(range, index) in proposal.proposalObject.ranges"
                :key="index">
                <link-to-iri
                  :term="range.predicate ? range.subject : { value: range.iri }" />
              </li>
            </ul>
          </td>
          <td>
            {{ proposal.proposalObject.comment }}
          </td>
        </tr>
      </tbody>
    </table>

    <table
      v-if="hasClassProposals"
      class="table generic-table is-fullwidth">
      <thead>
        <tr>
          <th>
            Modifications to
          </th>
          <th>
            Motivation
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="proposal in changedClassProposals.proposals"
          :key="proposal.id">
          <td>
            <nuxt-link :to="{ name: 'proposal-id', params: { id: proposal.id } }">
              {{ proposal.proposalObject.label }}
            </nuxt-link>
          </td>
          <td>
            {{ proposal.proposalObject.motivation }}
          </td>
        </tr>
      </tbody>
    </table>

    <table
      v-if="hasPropertyProposals"
      class="table generic-table is-fullwidth">
      <thead>
        <tr>
          <th>
            Modifications to
          </th>
          <th>
            Motivation
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="proposal in changedPropertyProposals.proposals"
          :key="proposal.id">
          <td>
            <nuxt-link :to="{ name: 'proposal-id', params: { id: proposal.id } }">
              {{ proposal.proposalObject.label }}
            </nuxt-link>
          </td>
          <td>
            {{ proposal.proposalObject.motivation }}
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import _get from 'lodash/get'
import LinkToIri from './LinkToIri'
import changedClassProposals from '@/apollo/queries/changedClassProposalsByIri'
import newObjectProposals from '@/apollo/queries/newObjectProposalsByIri'
import changedPropertyProposals from '@/apollo/queries/changedPropertyProposalsByIri'

export default {
  name: 'PropertyProposals',
  props: {
    iri: {
      type: String,
      required: true
    },
    isClass: {
      type: Boolean,
      required: true
    }
  },
  components: {
    LinkToIri
  },
  methods: {
    _get,
    authorsAvatar (name = '') {
      return `${name}'s avatar'`
    },
    cut (string) {
      return (string || '').substr(0, 150)
    },
    answersCount (proposal) {
      return _get(proposal, 'answers.messages', []).length
    }
  },
  computed: {
    hasObjectProposals () {
      return !!_get(this.newObjectProposals, 'proposals.length')
    },
    hasClassProposals () {
      return this.isClass && !!_get(this.changedClassProposals, 'proposals.length')
    },
    hasPropertyProposals () {
      return !!_get(this.changedPropertyProposals, 'proposals.length')
    },
    hasProposals () {
      return this.hasObjectProposals || this.hasClassProposals || this.hasPropertyProposals
    }
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
        return !this.isClass && (process.client && !this.$store.state.authProcessDone)
      }
    },
    changedClassProposals: {
      query: changedClassProposals,
      variables () {
        return {
          iri: this.iri
        }
      },
      fetchPolicy: 'no-cache',
      pollInterval: process.server ? null : 1000 * 15,
      result ({ data, loading }) {
        if (!loading) {
          const proposals = _get(data, 'changedClassProposals.proposals', [])
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
    },
    changedPropertyProposals: {
      query: changedPropertyProposals,
      variables () {
        return {
          iri: this.iri
        }
      },
      fetchPolicy: 'no-cache',
      pollInterval: process.server ? null : 1000 * 15,
      result ({ data, loading }) {
        if (!loading) {
          const proposals = _get(data, 'changedPropertyProposals.proposals', [])
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
