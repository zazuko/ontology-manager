<template>
  <table class="table is-striped is-narrow is-fullwidth">
    <thead>
      <tr>
        <th>Title</th>
        <th>Created by</th>
        <th>Last updated</th>
        <th>Status</th>
        <th>Vote</th>
        <th>Actions</th>
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
        <td>
          <span
            v-if="!proposal.isDraft">
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
  methods: {
    proposalType,
    async approve (proposal) {
      const body = {
        threadId: proposal.id,
        number: proposal.externalId
      }
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        const result = await axios.post('/api/proposal/merge', body, headers)
        console.log(result)
        this.$emit('updated', proposal.id)
        this.$toast.success('Proposal approved!', toastClose)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose)
      }
    },
    async reject (proposal, status = 'RESOLVED') {
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
    }
  }
}
</script>
