<template>
  <section class="section">

    <admin-menu class="container" />

    <admin-discussion-list
      :discussions="rows"
      @updated="refetch()"
      class="container" />
  </section>
</template>

<script>
import _get from 'lodash/get'
import adminDiscussionList from '@/apollo/queries/adminDiscussionList'
import AdminDiscussionList from '@/components/admin/AdminDiscussionList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'

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
      prefetch: true,
      query: adminDiscussionList,
      result ({ data, loading }) {
        if (!loading) {
          this.rows = _get(data, 'discussions.nodes', [])
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
