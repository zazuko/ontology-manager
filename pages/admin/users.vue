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
import AdminUserList from '@/components/AdminUserList.vue'
import AdminMenu from '@/components/AdminMenu.vue'
import { datasetsSetup } from '@/libs/utils'

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
  async created () {
    await datasetsSetup(this.$store)
  },
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
