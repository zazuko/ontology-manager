<template>
  <section class="container layout-admin">
    <admin-menu />

    <no-ssr>
      <div class="responsive-table">
        <admin-user-list
          :users="users"
          @updated="refetch()" />
      </div>
    </no-ssr>
  </section>
</template>

<script>
import _get from 'lodash/get'
import users from '@/apollo/queries/adminUserList'
import AdminUserList from '@/components/admin/AdminUserList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'
import { headTitle } from '@/libs/utils'

export default {
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
        return !this.$store.state.authProcessDone
      }
    }
  },
  head () {
    const h = {
      title: headTitle('Users Management - Admin')
    }
    return h
  }
}
</script>
