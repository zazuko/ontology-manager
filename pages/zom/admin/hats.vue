<template>
  <section class="container layout-admin">
    <admin-menu />

    <client-only>
      <div class="responsive-table layout-admin-main">
        <admin-hat-list
          :hats="hats"
          :users="users"
          @updated="refetch()" />
      </div>
    </client-only>
  </section>
</template>

<script>
import hats from '@/apollo/queries/adminHatList'
import users from '@/apollo/queries/adminUserList'
import AdminHatList from '@/components/admin/AdminHatList'
import AdminMenu from '@/components/admin/AdminMenu'

export default {
  layout: 'default',
  middleware: 'authenticatedAdmin',
  components: {
    AdminHatList,
    AdminMenu
  },
  data: () => ({
    hats: [],
    users: []
  }),
  methods: {
    refetch () {
      this.$apollo.queries.allHats.refetch()
    }
  },
  apollo: {
    allHats: {
      query: hats,
      result ({ data, loading }) {
        if (!loading) {
          this.hats = data.allHats.hats
        }
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    },
    users: {
      query: users,
      variables () {
        return {
          threadType: 'PROPOSAL'
        }
      },
      result ({ data, loading }) {
        if (!loading) {
          this.users = data.users.nodes
        }
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    }
  },
  head () {
    const h = {
      title: this.$headTitle('Hats Management - Admin')
    }
    return h
  }
}
</script>
