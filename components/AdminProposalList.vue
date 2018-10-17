<template>
  <table class="table is-bordered is-striped is-narrow is-fullwidth">
    <thead>
      <tr>
        <th>Title</th>
        <th>Created by</th>
        <th>Last updated</th>
        <th>Object</th>
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
          <small>
            <code>{{ proposal.iri }}</code>
          </small>
        </td>
        <td>{{ proposal.status }}</td>
        <td>
          ?
        </td>
        <td>
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
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AdminDiscussionList',
  props: ['proposals'],
  methods: {
    async approve (proposal) {
      const body = {
        threadId: proposal.id,
        number: proposal.externalId
      }
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        const result = await axios.post('/api/proposal/merge', body, headers)
        this.$emit('updated', proposal.id)
        console.log(result)
      } catch (err) {
        console.error(err)
      }
    },
    async reject (proposal, status = 'hidden') {
      const body = {
        threadId: proposal.id,
        number: proposal.externalId,
        status
      }
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        const result = await axios.post('/api/proposal/close', body, headers)
        this.$emit('updated', proposal.id)
        console.log(result)
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>
