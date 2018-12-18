<template>
  <section class="container layout-admin">
    <admin-menu />

    <no-ssr>
      <admin-proposal-list
        v-model="orderBy"
        :proposals="proposals"
        @updated="refetch()" />
    </no-ssr>
  </section>
</template>

<script>
import _get from 'lodash/get'
import adminProposalList from '@/apollo/queries/adminProposalList'
import AdminProposalList from '@/components/admin/AdminProposalList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'
import { headTitle } from '@/libs/utils'

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
      query: adminProposalList,
      variables () {
        const vars = {}
        if (this.orderBy.length) {
          vars.orderBy = this.orderBy
        }
        return vars
      },
      result ({ data, loading }) {
        if (!loading) {
          this.proposals = _get(data, 'discussions.nodes', [])
            .filter(node => node.status !== 'HIDDEN')
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  },
  head () {
    const h = {
      title: headTitle('Proposals Management - Admin')
    }
    return h
  }
}
</script>
