<template>
  <table class="table admin-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Created by</th>
        <th>Last updated</th>
        <th>Object</th>
        <th>Status</th>
        <th>Vote</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="discussion in discussions"
        :key="discussion.id">
        <td>
          <p>
            <nuxt-link :to="{ name: 'discussion-id', params: { id: discussion.id } }">
              {{ discussion.headline }}
            </nuxt-link>
          </p>
        </td>
        <td>
          {{ discussion.author.name }}
        </td>
        <td>
          <p>
            {{ discussion.updatedAt|formatDate }}
          </p>
          <p>
            <span class="info">
              (Created: {{ discussion.createdAt|formatDate }})
            </span>
          </p>
        </td>
        <td>
          <p>
            <code>{{ discussion.iri }}</code>
          </p>
        </td>
        <td>
          <p>{{ discussion.status }}</p>
        </td>
        <td>
          <p>?</p>
        </td>
        <td class="has-text-right">
          <button
            v-show="discussion.status !== 'OPEN'"
            class="button is-small is-info"
            @click.prevent="reopen(discussion.id)">
            Reopen
          </button>
          <button
            v-show="discussion.status === 'OPEN'"
            class="button is-small is-info"
            @click.prevent="resolve(discussion.id)">
            Resolve
          </button>
          <button
            v-show="discussion.status === 'OPEN'"
            class="button is-small is-dark-info"
            @click.prevent="hide(discussion.id)">
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
  props: {
    discussions: {
      type: Array,
      required: true,
      default () {
        return []
      }
    }
  },
  methods: {
    async resolve (threadId) {
      this.mutate(threadId, 'RESOLVED')
    },
    async hide (threadId) {
      this.mutate(threadId, 'HIDDEN')
    },
    async reopen (threadId) {
      this.mutate(threadId, 'OPEN')
    },
    async mutate (threadId, newStatus) {
      const variables = {
        threadId,
        newStatus
      }
      try {
        await this.$apollo.mutate({ mutation, variables })
        this.$emit('updated', threadId)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
      }
    }
  }
}
</script>
