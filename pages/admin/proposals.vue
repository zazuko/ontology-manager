<template>
  <section class="container layout-admin">
    <admin-menu />

    <no-ssr>
      <pagination
        :page="page"
        :is-last-page="lastPage"
        route="admin-proposals" />
      <div class="responsive-table">
        <admin-proposal-list
          :proposals="proposals"
          @sort="sortUpdate"
          @status-filter="statusFilterUpdate"
          @updated="refetch()" />
      </div>
    </no-ssr>
  </section>
</template>

<script>
import _get from 'lodash/get'
import adminProposalList from '@/apollo/queries/adminProposalList'
import AdminProposalList from '@/components/admin/AdminProposalList.vue'
import AdminMenu from '@/components/admin/AdminMenu.vue'
import Pagination from '@/components/layout/Pagination.vue'
import { headTitle } from '@/libs/utils'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminMenu,
    AdminProposalList,
    Pagination
  },
  data () {
    return {
      proposals: [],
      orderBy: [],
      filterStatus: false,
      pageSize: 10
    }
  },
  computed: {
    lastPage () {
      return this.proposals.length < this.pageSize
    },
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
        return !this.$store.state.authProcessDone
      }
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
