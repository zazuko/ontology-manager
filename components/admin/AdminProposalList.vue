<template>
  <table class="table is-striped is-narrow">
    <thead>
      <tr>
        <th>
          <a
            class="sort-by"
            :class="{ [String(orderBy['HEADLINE']).toLowerCase()]: orderBy['HEADLINE'] }"
            @click.prevent="sort('HEADLINE')">
            Title
          </a>
        </th>
        <th>
          Created by
        </th>
        <th>
          <a
            class="sort-by"
            :class="{ [String(orderBy['UPDATED_AT']).toLowerCase()]: orderBy['UPDATED_AT'] }"
            @click.prevent="sort('UPDATED_AT')">
            Last updated
          </a>
        </th>
        <th>
          Status
        </th>
        <th>
          Vote
        </th>
        <th>
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="proposal in rows"
        :key="proposal.id">
        <td>
          <nuxt-link :to="{ name: 'proposal-id', params: { id: proposal.id } }">
            {{ proposal.headline }}
          </nuxt-link>
        </td>
        <td>
          {{ proposal.author.name }}
        </td>
        <td>
          {{ proposal.updatedAt|formatDate }}
          <br>
          <small>
            (Created: {{ proposal.createdAt|formatDate }})
          </small>
        </td>
        <td>
          {{ proposal.status }}
          <br>
          <small>
            {{ proposal.proposalType }}
          </small>
        </td>
        <td>
          <div class="votes votes--admin">
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
        <td class="has-text-centered">
          <span
            v-if="!proposal.isDraft">
            <p>
              <button
                class="button is-small is-success"
                :disabled="proposal.status !== 'OPEN'"
                @click.prevent="approve(proposal)">
                Approve
              </button>
              <button
                class="button is-small is-danger"
                :disabled="proposal.status !== 'OPEN'"
                @click.prevent="reject(proposal)">
                Reject
              </button>
              <button
                class="button is-small is-danger is-outlined"
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
        this.$toast.success('Proposal approved!', toastClose)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose)
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
        this.$toast.success('Proposal rejected!', toastClose)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose)
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
        this.$toast.success('Proposal deleted!', toastClose)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose)
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
