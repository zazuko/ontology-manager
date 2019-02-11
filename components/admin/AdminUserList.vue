<template>
  <table class="table admin-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Username</th>
        <th>Status</th>
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
              v-if="user.isSuperadmin"
              class="tag is-warning admin-flag">
              Superadmin
            </span>
            <span
              v-else-if="user.isAdmin"
              class="tag is-info admin-flag">
              Admin
            </span>
            <span
              v-else
              class="tag is-grey admin-flag">
              User
            </span>
          </p>
        </td>
        <td class="has-text-right">
          <template v-if="$store.state.auth.isSuperadmin">
            <button
              v-show="user.isSuperadmin"
              class="button is-small is-warning admin-action"
              @click.prevent="demote(user.id, 'superadmin')">
              Demote from superadmin
            </button>
            <button
              v-show="!user.isSuperadmin && user.isAdmin"
              class="button is-small is-info admin-action"
              @click.prevent="demote(user.id, 'admin')">
              Demote from admin
            </button>
            <button
              v-show="!user.isSuperadmin && user.isAdmin"
              class="button is-small is-warning admin-action"
              @click.prevent="promote(user.id, 'superadmin')">
              Promote to superadmin
            </button>
            <button
              v-show="!user.isSuperadmin && !user.isAdmin"
              class="button is-small is-dark-info admin-action"
              @click.prevent="promote(user.id, 'admin')">
              Promote to admin
            </button>
          </template>
          <template v-else-if="$store.state.auth.isAdmin">
            <button
              v-show="!user.isSuperadmin && user.isAdmin"
              class="button is-small is-info admin-action"
              @click.prevent="demote(user.id, 'admin')">
              Demote from admin
            </button>
            <button
              v-show="!user.isSuperadmin && !user.isAdmin"
              class="button is-small is-dark-info admin-action"
              @click.prevent="promote(user.id, 'admin')">
              Promote to admin
            </button>
          </template>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import makeAdmin from '@/apollo/mutations/makeAdmin'
import makeSuperadmin from '@/apollo/mutations/makeSuperadmin'

export default {
  name: 'AdminUserList',
  props: ['users'],
  methods: {
    async promote (userId, status) {
      this.mutate(userId, true, status)
    },
    async demote (userId, status) {
      this.mutate(userId, false, status)
    },
    async mutate (userId, adminFlag, status) {
      const mutation = status === 'superadmin' ? makeSuperadmin : makeAdmin
      const variables = {
        userId,
        [status === 'superadmin' ? 'superadminFlag' : 'adminFlag']: adminFlag
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
