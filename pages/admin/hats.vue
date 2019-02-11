<template>
  <section class="container layout-admin">
    <admin-menu />

    <no-ssr>
      <div class="responsive-table">
        <admin-hat-list
          :hats="hats"
          :users="users"
          @updated="refetch()" />
      </div>
    </no-ssr>
  </section>
</template>

<script>
import hats from '@/apollo/queries/adminHatList'
import users from '@/apollo/queries/adminUserList'
import AdminHatList from '@/components/admin/AdminHatList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'
import { headTitle } from '@/libs/utils'

export default {
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
        return !this.$store.state.authProcessDone
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
        return !this.$store.state.authProcessDone
      }
    }
  },
  head () {
    const h = {
      title: headTitle('Hats Management - Admin')
    }
    return h
  }
}
</script>
