<template>
  <section class="section has-background-white">

    <div class="level">
      <div class="level-left">
        <h1 class="title">Proposals</h1>
      </div>
      <div class="level-right">
        <span class="navbar-item">
          <nuxt-link
            :to="{ name: 'proposal-new-property', query: { iri: iri } }"
            class="button is-info">
            Request New Property
          </nuxt-link>
        </span>
      </div>
    </div>

    <table
      v-if="_get(proposals, 'proposals.length')"
      class="table is-fullwidth">
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
            <nuxt-link :to="{ name: 'proposal-new-property', query: { id: proposal.id } }">
              {{ proposal.proposalObject.label }}
            </nuxt-link>
          </td>
          <td>
            <ul class="types-list">
              <li
                v-for="(range, index) in proposal.proposalObject.ranges"
                :key="index">
                <link-to-IRI
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
import LinkToIRI from './LinkToIRI'
import proposals from '@/apollo/queries/proposalsByIri'
import { proposalDeserializer } from '@/libs/proposals'

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
    LinkToIRI
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
