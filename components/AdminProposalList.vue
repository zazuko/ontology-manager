<template>
  <table class="table is-bordered is-striped is-narrow is-fullwidth">
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
        v-for="proposal in proposals"
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
            {{ proposalType(proposal.proposalObject) }}
          </small>
        </td>
        <td>
          ?
        </td>
        <td>
          <span
            v-if="proposal.status !== 'DRAFT'">
            <button
              class="button is-small is-success"
              :disabled="proposal.status !== 'OPEN'"
              @click="approve(proposal)">
              Approve
            </button>
            <button
              class="button is-small is-danger"
              :disabled="proposal.status !== 'OPEN'"
              @click="reject(proposal)">
              Reject
            </button>
          </span>
          <span v-else>
            <nuxt-link
              v-if="proposalType(proposal.proposalObject) === 'Class'"
              :to="{ name: 'proposal-new-class', query: { id: proposal.id } }"
              class="button is-small is-info">
              See
            </nuxt-link>
            <nuxt-link
              v-if="proposalType(proposal.proposalObject) === 'Property'"
              :to="{ name: 'proposal-new-property', query: { id: proposal.id } }"
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
  props: ['proposals'],
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
      } catch (err) {
        console.error(err)
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
      } catch (err) {
        console.error(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose)
      }
    }
  }
}
</script>
