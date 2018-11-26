<template>
  <table class="table is-striped is-narrow is-fullwidth">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Username</th>
        <th>Is Admin</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="user in users"
        :key="user.id">
        <td>
          {{ user.id }}
        </td>
        <td>
          {{ user.name }}
        </td>
        <td>
          {{ user.username }}
        </td>
        <td>
          <span
            v-show="user.isAdmin"
            class="tag is-warning admin-flag">
            yes
          </span>
          <span
            v-show="!user.isAdmin"
            class="tag is-light admin-flag">
            no
          </span>
        </td>
        <td>
          <button
            v-show="user.isAdmin"
            class="button is-small is-info admin-action"
            @click.prevent="demote(user.id)">
            Demote
          </button>
          <button
            v-show="!user.isAdmin"
            class="button is-small is-danger admin-action"
            @click.prevent="promote(user.id)">
            Promote
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import mutation from '@/apollo/mutations/changePersonStatus'

export default {
  name: 'AdminUserList',
  props: ['users'],
  methods: {
    async promote (userId) {
      this.mutate(userId, true)
    },
    async demote (userId) {
      this.mutate(userId, false)
    },
    async mutate (userId, adminFlag) {
      const variables = {
        userId,
        adminFlag
      }
      try {
        await this.$apollo.mutate({ mutation, variables })
        this.$emit('updated', userId)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
      }
    }
  }
}
</script>

<style scoped>
.admin-action {
  min-width: 68px;
}
.admin-flag {
  min-width: 36px;
}
</style>
