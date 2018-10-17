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
        v-for="discussion in discussions"
        :key="discussion.id">
        <td>
          <nuxt-link :to="{ name: 'discussion-id', params: { id: discussion.id } }">
            {{ discussion.headline }}
          </nuxt-link>
        </td>
        <td>
          {{ discussion.author.name }}
        </td>
        <td>
          {{ discussion.updatedAt|formatDate }}
          <br>
          <small>
            (Created: {{ discussion.createdAt|formatDate }})
          </small>
        </td>
        <td>
          <small>
            <code>{{ discussion.iri }}</code>
          </small>
        </td>
        <td>{{ discussion.status }}</td>
        <td>
          ?
        </td>
        <td>
          <button
            v-show="discussion.status !== 'OPEN'"
            class="button is-small is-primary"
            @click="reopen(discussion.id)">
            Reopen
          </button>
          <button
            v-show="discussion.status === 'OPEN'"
            class="button is-small is-success"
            @click="resolve(discussion.id)">
            Resolve
          </button>
          <button
            v-show="discussion.status === 'OPEN'"
            class="button is-small is-danger"
            @click="hide(discussion.id)">
            Hide / Close
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import mutation from '@/apollo/mutations/changeDiscussionStatus'

export default {
  name: 'AdminDiscussionList',
  props: ['discussions'],
  methods: {
    async resolve (threadId) {
      const variables = {
        threadId,
        newStatus: 'RESOLVED'
      }

      this.$apollo.mutate({ mutation, variables })
        .then((data) => {
          this.$emit('updated', threadId)
        })
        .catch((err) => {
          console.error(err)
        })
    },
    async hide (threadId) {
      const variables = {
        threadId,
        newStatus: 'HIDDEN'
      }

      this.$apollo.mutate({ mutation, variables })
        .then((data) => {
          this.$emit('updated', threadId)
        })
        .catch((err) => {
          console.error(err)
        })
    },
    async reopen (threadId) {
      const variables = {
        threadId,
        newStatus: 'OPEN'
      }

      this.$apollo.mutate({ mutation, variables })
        .then((data) => {
          this.$emit('updated', threadId)
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }
}
</script>
