<template>
  <section class="container">
    <admin-menu />

    <admin-proposal-list
      :proposals="discussions.nodes"
      @updated="refetch()" />

  </section>
</template>

<script>
import allDiscussions from '@/apollo/queries/adminWorklist'
import AdminProposalList from '@/components/AdminProposalList.vue'
import AdminMenu from '@/components/AdminMenu.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminProposalList,
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
          threadType: 'PROPOSAL'
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
