<template>
  <table class="table admin-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Username</th>
        <th>Is Admin</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="user in users"
        :key="user.id">
        <td>
          <p>{{ user.id }}</p>
        </td>
        <td>
          <p>{{ user.name }}</p>
        </td>
        <td>
          <p>{{ user.username }}</p>
        </td>
        <td>
          <p>
            <span
              v-show="user.isAdmin"
              class="tag is-info admin-flag">
              Yes
            </span>
            <span
              v-show="!user.isAdmin"
              class="tag is-grey admin-flag">
              No
            </span>
          </p>
        </td>
        <td class="has-text-right">
          <button
            v-show="user.isAdmin"
            class="button is-small is-info admin-action"
            @click.prevent="demote(user.id)">
            Demote
          </button>
          <button
            v-show="!user.isAdmin"
            class="button is-small is-dark-info admin-action"
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
