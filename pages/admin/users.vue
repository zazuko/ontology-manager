<template>
  <section class="container layout-admin">
    <admin-menu />

    <client-only>
      <div class="responsive-table layout-admin-main">
        <admin-user-list
          :users="users"
          @updated="refetch()" />
      </div>
    </client-only>
  </section>
</template>

<script>
import _get from 'lodash/get'
import users from '@/apollo/queries/adminUserList'
import AdminUserList from '@/components/admin/AdminUserList'
import AdminMenu from '@/components/admin/AdminMenu'

export default {
  layout: 'default',
  middleware: 'authenticatedAdmin',
  components: {
    AdminUserList,
    AdminMenu
  },
  data: () => ({
    users: []
  }),
  methods: {
    refetch () {
      this.$apollo.queries.users.refetch()
    }
  },
  apollo: {
    users: {
      query: users,
      variables () {
        return {
          threadType: 'PROPOSAL'
        }
      },
      fetchPolicy: 'cache-and-network',
      result ({ data, loading }) {
        if (!loading) {
          this.users = _get(data, 'users.nodes', [])
        }
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    }
  },
  head () {
    const h = {
      title: this.$headTitle('Users Management - Admin')
    }
    return h
  }
}
</script>
