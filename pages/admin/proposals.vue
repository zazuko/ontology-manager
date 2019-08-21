<template>
  <section class="container layout-admin">
    <admin-menu />

    <client-only>
      <pagination
        :page="page"
        :results-count="proposalsCount"
        :results-per-page="pageSize"
        route="admin-proposals" />
      <div class="responsive-table">
        <admin-proposal-list
          :proposals="proposals"
          @sort="sortUpdate"
          @status-filter="statusFilterUpdate"
          @updated="refetch()" />
      </div>
    </client-only>
  </section>
</template>

<script>
import _get from 'lodash/get'
import adminProposalList from '@/apollo/queries/adminProposalList'
import adminProposalListPageCount from '@/apollo/queries/adminProposalListPageCount'
import AdminProposalList from '@/components/admin/AdminProposalList'
import AdminMenu from '@/components/admin/AdminMenu'
import Pagination from '@/components/layout/Pagination'

export default {
  layout (context) {
    return `default-${context.app.$env.EDITOR_STYLE}`
  },
  middleware: 'authenticatedAdmin',
  components: {
    AdminMenu,
    AdminProposalList,
    Pagination
  },
  data () {
    return {
      proposals: [],
      orderBy: ['UPDATED_AT_DESC'],
      filterStatus: false,
      pageSize: 10,
      proposalsCount: 0
    }
  },
  computed: {
    page () {
      const page = this.$route.query.page ? parseInt(this.$route.query.page, 10) : 1
      return page
    }
  },
  methods: {
    refetch () {
      this.$apollo.queries.discussions.refetch()
    },
    sortUpdate (sortBy) {
      this.orderBy = sortBy
    },
    statusFilterUpdate (status) {
      if (status === 'all') {
        this.filterStatus = false
      }
      else {
        this.filterStatus = status
      }
    }
  },
  apollo: {
    discussions: {
      query: adminProposalList,
      variables () {
        const vars = {
          first: this.pageSize,
          offset: (this.page - 1) * this.pageSize
        }
        if (this.orderBy.length) {
          vars.orderBy = this.orderBy
        }
        if (this.filterStatus) {
          vars.status = this.filterStatus.toUpperCase()
        }
        return vars
      },
      result ({ data, loading }) {
        if (!loading) {
          this.proposals = _get(data, 'discussions.nodes', [])
        }
      },
      fetchPolicy: 'cache-and-network',
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    },
    count: {
      query: adminProposalListPageCount,
      variables () {
        const vars = {}
        if (this.filterStatus) {
          vars.status = this.filterStatus.toUpperCase()
        }
        return vars
      },
      result ({ data, loading }) {
        if (!loading) {
          this.proposalsCount = _get(data, 'count.nodes.length', 0)
        }
      },
      fetchPolicy: 'cache-and-network',
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    }
  },
  head () {
    const h = {
      title: this.$headTitle('Proposals Management - Admin')
    }
    return h
  }
}
</script>
