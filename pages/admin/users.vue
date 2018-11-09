<template>
  <section class="section">
    <div class="container">

      <admin-menu />

      <admin-user-list
        :users="users.nodes"
        @updated="refetch()" />

    </div>
  </section>
</template>

<script>
import users from '@/apollo/queries/adminUserList'
import AdminUserList from '@/components/admin/AdminUserList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminUserList,
    AdminMenu
  },
  data: () => ({
    users: {
      nodes: []
    }
  }),
  methods: {
    refetch () {
      this.$apollo.queries.users.refetch()
    }
  },
  apollo: {
    users: {
      prefetch: true,
      query: users,
      variables () {
        return {
          threadType: 'PROPOSAL'
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
