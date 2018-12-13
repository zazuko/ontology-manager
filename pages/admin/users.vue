<template>
  <section class="section">
    <admin-menu class="container" />

    <no-ssr>
      <admin-user-list
        :users="users"
        @updated="refetch()"
        class="container" />
    </no-ssr>
  </section>
</template>

<script>
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
          this.users = data.users.nodes
        }
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
