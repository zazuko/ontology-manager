<template>
  <section class="section">
    <div class="container">

      <admin-menu />

      <admin-proposal-list
        v-model="orderBy"
        :proposals="proposals"
        @updated="refetch()" />

    </div>
  </section>
</template>

<script>
import adminWorklist from '@/apollo/queries/adminWorklist'
import AdminProposalList from '@/components/admin/AdminProposalList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminProposalList,
    AdminMenu
  },
  data: () => ({
    proposals: [],
    orderBy: []
  }),
  methods: {
    refetch () {
      this.$apollo.queries.discussions.refetch()
    }
  },
  apollo: {
    discussions: {
      prefetch: true,
      query: adminWorklist,
      variables () {
        const vars = {
          threadType: 'PROPOSAL'
        }
        if (this.orderBy.length) {
          vars.orderBy = this.orderBy
        }
        return vars
      },
      result ({ data, loading }) {
        if (!loading) {
          this.proposals = data.discussions.nodes.filter(node => node.status !== 'HIDDEN')
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
