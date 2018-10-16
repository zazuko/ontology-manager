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
            class="button is-small is-success"
            :disabled="discussion.status !== 'OPEN'"
            @click="approve(discussion.id)">
            Approve
          </button>
          <button
            class="button is-small is-danger"
            :disabled="discussion.status !== 'OPEN'"
            @click="reject(discussion.id)">
            Reject
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>

export default {
  name: 'AdminDiscussionList',
  props: ['discussions'],
  methods: {
    approve (id) {

    },
    reject (id) {

    }
  }
}
</script>
