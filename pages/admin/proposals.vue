<template>
  <section class="section">
    <div class="container">

      <admin-menu />

      <admin-proposal-list
        :proposals="proposals"
        @updated="refetch()" />

    </div>
  </section>
</template>

<script>
import allDiscussions from '@/apollo/queries/adminWorklist'
import AdminProposalList from '@/components/admin/AdminProposalList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminProposalList,
    AdminMenu
  },
  data: () => ({
    proposals: []
  }),
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
      result ({ data, loading }) {
        if (!loading) {
          this.proposals = data.discussions.nodes
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
