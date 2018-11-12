<template>
  <section>
    <header>
      <nav class="navbar">
        <div class="navbar-brand">
          <a class="navbar-item">
            <h1 class="title">Proposals</h1>
          </a>
        </div>
        <div class="navbar-end">
          <span
            v-if="isClass"
            class="navbar-item">
            <nuxt-link
              :to="{ name: 'proposal-new-property', query: { iri: iri } }"
              class="button is-info">
              Request New Property
            </nuxt-link>
          </span>
          <span
            v-else
            class="navbar-item">
            <nuxt-link
              :to="{ name: 'proposal-new-class', query: { iri: iri } }"
              class="button is-info">
              Request New Class
            </nuxt-link>
          </span>
        </div>
      </nav>
    </header>
    <table
      v-if="proposals"
      class="table is-fullwidth">
      <thead>
        <tr>
          <th>
            Property
          </th>
          <th>
            Expected<br>Type
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
            <ul>
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
    <div v-else />
  </section>
</template>

<script>
import _get from 'lodash/get'
import LinkToIRI from './LinkToIRI'
import proposals from '@/apollo/queries/proposalsByIri'
import { proposalDeserializer } from '@/libs/proposals'

export default {
  name: 'Proposals',
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
