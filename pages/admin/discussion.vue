<template>
  <section class="section">
    <div class="container">

      <admin-menu />

      <admin-discussion-list
        :discussions="discussions.nodes"
        @updated="refetch()" />

    </div>
  </section>
</template>

<script>
import allDiscussions from '@/apollo/queries/adminWorklist'
import AdminDiscussionList from '@/components/admin/AdminDiscussionList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminDiscussionList,
    AdminMenu
  },
  data: () => ({
    discussions: {
      nodes: []
    }
  }),
  async created () {
    await datasetsSetup(this.$store)
  },
  methods: {
    refetch () {
      this.$apollo.queries.discussions.refetch()
    }
  },
  apollo: {
    discussions: {
      prefetch: true,
      query: allDiscussions,
      variables () {
        return {
          threadType: 'DISCUSSION'
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
