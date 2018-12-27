<template>
  <table class="table admin-table">
    <thead>
      <tr>
        <th>
          <a
            class="sort-by"
            @click.prevent="sort('HEADLINE')">
            Title
            <span class="sort-icon">
              <i :class="{ [String(orderBy['HEADLINE']).toLowerCase()]: orderBy['HEADLINE'] }" />
            </span>
          </a>
        </th>
        <th>
          Created by
        </th>
        <th>
          <a
            class="sort-by"
            @click.prevent="sort('UPDATED_AT')">
            Last updated
            <span class="sort-icon">
              <i :class="{ [String(orderBy['UPDATED_AT']).toLowerCase()]: orderBy['UPDATED_AT'] }" />
            </span>
          </a>
        </th>
        <th>
          <a
            class="sort-by"
            @click.prevent="sort('STATUS')">
            Status
            <span class="sort-icon">
              <i :class="{ [String(orderBy['STATUS']).toLowerCase()]: orderBy['STATUS'] }" />
            </span>
          </a>
        </th>
        <th>
          Votes
        </th>
        <th>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="proposal in rows"
        :key="proposal.id">
        <td>
          <p>
            <nuxt-link :to="{ name: 'proposal-id', params: { id: proposal.id } }">
              {{ proposal.headline }}
            </nuxt-link>
            <forge-link
              :id="proposal.externalId"
              class="is-link" />
          </p>
          <p>
            <span class="info">on {{ proposal.iri }}</span>
          </p>
        </td>
        <td>
          {{ proposal.author.name }}
        </td>
        <td>
          <p>
            {{ proposal.updatedAt|formatDate }}
          </p>
          <p>
            <span class="info">
              (Created: {{ proposal.createdAt|formatDate }})
            </span>
          </p>
        </td>
        <td>
          <p>
            {{ proposal.status }}
          </p>
          <p>
            <span class="info">
              {{ proposal.proposalType }}
            </span>
          </p>
        </td>
        <td>
          <div class="votes">
            <div class="vote-cell">
              <span class="icon">
                <i class="mdi mdi-thumb-up-outline" />
              </span>
              {{ proposal.tally.upvotes }}
            </div>
            <div class="vote-cell">
              <span class="icon">
                <i class="mdi mdi-thumb-down-outline" />
              </span>
              {{ proposal.tally.downvotes }}
            </div>
          </div>
        </td>
        <td class="has-text-right">
          <span
            v-if="!proposal.isDraft">
            <p>
              <button
                class="button is-small is-info"
                :disabled="proposal.status !== 'OPEN'"
                @click.prevent="approve(proposal)">
                Approve
              </button>
              <button
                class="button is-small is-dark-info"
                :disabled="proposal.status !== 'OPEN'"
                @click.prevent="reject(proposal)">
                Reject
              </button>
              <button
                class="button is-small is-grey is-outlined"
                :disabled="proposal.status !== 'OPEN'"
                @click.prevent="hide(proposal)">
                Delete
              </button>
            </p>
          </span>
          <span v-else>
            <nuxt-link
              v-if="proposal.proposalType === 'Class'"
              :to="{ name: 'proposal-id', params: { id: proposal.id } }"
              class="button is-small is-info">
              See
            </nuxt-link>
            <nuxt-link
              v-if="proposal.proposalType === 'Property'"
              :to="{ name: 'proposal-id', params: { id: proposal.id } }"
              class="button is-small is-info">
              See
            </nuxt-link>
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import axios from 'axios'
import { toastClose } from '@/libs/utils'
import { proposalType } from '@/libs/proposals'
import ForgeLink from './ForgeLink'

export default {
  name: 'AdminProposalList',
  props: {
    proposals: {
      type: Array,
      required: true,
      default () {
        return []
      }
    },
    value: {
      type: Array,
      required: true,
      default () {
        return []
      }
    }
  },
  components: {
    ForgeLink
  },
  computed: {
    rows () {
      return this.proposals.map((proposal) => {
        proposal.tally = this.tally(proposal.votesByThreadId.votes)
        proposal.proposalType = this.proposalType(proposal.proposalObject)
        return proposal
      })
    }
  },
  data () {
    return {
      orderBy: {
        ID: false,
        HEADLINE: false,
        AUTHOR_ID: false,
        HAT_ID: false,
        THREAD_TYPE: false,
        UPDATED_AT: false,
        STATUS: false
      }
    }
  },
  methods: {
    proposalType,
    async approve (proposal) {
      const body = {
        threadId: proposal.id,
        number: proposal.externalId
      }
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        await axios.post('/api/proposal/merge', body, headers)
        this.$emit('updated', proposal.id)
        this.$store.dispatch('graph/RELOAD_DATASET')
        this.$toast.success('Proposal approved!', toastClose).goAway(1600)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose).goAway(1600)
      }
    },
    async reject (proposal, status = 'REJECTED') {
      const body = {
        threadId: proposal.id,
        number: proposal.externalId,
        status
      }
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        await axios.post('/api/proposal/close', body, headers)
        this.$emit('updated', proposal.id)
        this.$toast.success('Proposal rejected!', toastClose).goAway(1600)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose).goAway(1600)
      }
    },
    async hide (proposal, status = 'HIDDEN') {
      const body = {
        threadId: proposal.id,
        number: proposal.externalId,
        status
      }
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        await axios.post('/api/proposal/close', body, headers)
        this.$emit('updated', proposal.id)
        this.$toast.success('Proposal deleted!', toastClose).goAway(1600)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose).goAway(1600)
      }
    },
    tally (votes = []) {
      return votes.reduce((acc, { vote } = {}) => {
        switch (vote) {
          case 'UPVOTE':
            acc.upvotes += 1
            break
          case 'NEUTRAL':
            acc.neutrals += 1
            break
          case 'DOWNVOTE':
            acc.downvotes += 1
            break
        }
        return acc
      }, { upvotes: 0, neutrals: 0, downvotes: 0 })
    },
    sort (key) {
      if (this.orderBy[key]) {
        const opposite = this.orderBy[key] === 'ASC' ? 'DESC' : 'ASC'
        this.orderBy[key] = opposite
      }
      else {
        this.orderBy[key] = 'DESC'
      }
      const filters = Object.entries(this.orderBy)
        .filter(([key, val]) => val)
        .map(([key, val]) => `${key}_${val}`)
      this.$emit('input', filters)
    }
  }
}
</script>
