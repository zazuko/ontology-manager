<template>
  <section class="container layout-admin">
    <admin-menu />

    <no-ssr>
      <div class="responsive-table">
        <admin-discussion-list
          :discussions="rows"
          @updated="refetch()" />
      </div>
    </no-ssr>
  </section>
</template>

<script>
import _get from 'lodash/get'
import adminDiscussionList from '@/apollo/queries/adminDiscussionList'
import AdminDiscussionList from '@/components/admin/AdminDiscussionList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'
import { headTitle } from '@/libs/utils'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminDiscussionList,
    AdminMenu
  },
  data: () => ({
    rows: []
  }),
  methods: {
    refetch () {
      this.$apollo.queries.discussions.refetch()
    }
  },
  apollo: {
    discussions: {
      query: adminDiscussionList,
      result ({ data, loading }) {
        if (!loading) {
          this.rows = _get(data, 'discussions.nodes', [])
        }
      },
      fetchPolicy: 'cache-and-network',
      skip () {
        return !this.$store.state.authProcessDone
      }
    }
  },
  head () {
    const h = {
      title: headTitle('Discussions Management - Admin')
    }
    return h
  }
}
</script>
