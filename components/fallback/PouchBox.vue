<template>
  <article
    :id="iriToId(iri)"
    class="tile is-child class-box">
    <nuxt-link :to="(to.name || to.path) ? to : ''">
      <span
        v-show="isProposal"
        class="class-box-toast">
        Proposal
      </span>
      <p
        v-show="modified"
        class="class-box-update">
        Last updated:
        <span v-if="modified">
          {{ (new Date(modified)) | formatDate }}
        </span>
        <span v-else>&mdash;</span>
      </p>
      <img
        v-show="type === 'container'"
        src="~/assets/images/ic-pouch.svg"
        alt="Pouch icon"
        title="Pouch icon"
        class="class-box-icon">
      <img
        v-show="type === 'class'"
        src="~/assets/images/ic-class.svg"
        alt="Class icon"
        title="Class icon"
        class="class-box-icon">
      <p class="class-box-title">
        <template v-if="type === 'container'">
          {{ label }}
        </template>
        <template v-else>
          {{ $getTerm(iri) || label }}
        </template>
      </p>
      <div class="class-box-level">
        <div
          v-show="type === 'container'"
          class="class-box-level-item">
          <span class="class-box-label">
            Object{{ classesCount === 1 ? '' : 's' }}
          </span>
          <span class="class-box-value">
            {{ classesCount }}
          </span>
        </div>
        <div
          v-show="!isProposal"
          class="class-box-level-item">
          <span class="class-box-label">
            Proposal{{ proposalCount === 1 ? '' : 's' }}
          </span>
          <span class="class-box-value">
            {{ proposalCount }}
          </span>
        </div>
        <!--<div class="class-box-level-item">
          <span class="class-box-label">
            Propert{{ propertiesCount === 1 ? 'y' : 'ies' }}
          </span>
          <span class="class-box-value">
            {{ propertiesCount }}
          </span>
        </div>-->
      </div>
    </nuxt-link>
  </article>
</template>

<script>
import _get from 'lodash/get'
import { iriToId } from '@/libs/utils'
import countProposalsByIri from '@/apollo/queries/countProposalsByIri'

export default {
  name: 'PouchBox',
  props: {
    label: {
      type: String,
      required: true
    },
    to: {
      type: Object,
      required: false,
      default: null
    },
    iri: {
      type: String,
      required: true
    },
    classesCount: {
      type: Number,
      required: false,
      default: 0
    },
    propertiesCount: {
      type: Number,
      required: true
    },
    modified: {
      type: String,
      required: false,
      default: ''
    },
    type: {
      type: String,
      required: false,
      default: ''
    },
    isProposal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      proposalCount: 0
    }
  },
  methods: {
    iriToId
  },
  apollo: {
    proposals: {
      query: countProposalsByIri,
      variables () {
        return {
          iri: this.iri
        }
      },
      fetchPolicy: 'no-cache',
      pollInterval: 1000 * Math.round(30 + Math.random() * 20),
      result ({ data, loading }) {
        if (!loading) {
          const proposals = _get(data, 'proposals.proposals', [])
          this.proposalCount = proposals.length
        }
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone) ||
          this.type !== 'container' ||
          this.isProposal
      }
    }
  }
}
</script>
