<template>
  <section class="section">
    <h2 class="title is-2">
      Proposals
      <template v-if="$auth && $auth.$state.loggedIn">
        <nuxt-link
          :to="{ name: 'proposal-property', query: { iri: iri } }"
          id="proposal-add-property"
          title="Request new property"
          class="title-edit-button">
          +
        </nuxt-link>
      </template>
    </h2>

    <table
      v-if="_get(proposals, 'proposals.length')"
      class="table generic-table is-fullwidth">
      <thead>
        <tr>
          <th>
            Property
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
          v-for="proposal in proposals.proposals"
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
    <div v-else>
      <p>No proposal on this object at the moment.</p>
    </div>
  </section>
</template>

<script>
import _get from 'lodash/get'
import LinkToIri from './LinkToIri'
import proposals from '@/apollo/queries/proposalsByIri'
import { proposalDeserializer } from '@/libs/proposals'

export default {
  name: 'PropertyProposals',
  props: {
    iri: {
      type: String,
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
