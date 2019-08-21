<template>
  <section class="container layout-admin">
    <admin-menu />

    <client-only>
      <pagination
        :page="page"
        :results-count="discussionsCount"
        :results-per-page="pageSize"
        route="admin-discussions" />
      <div class="responsive-table">
        <admin-discussion-list
          :discussions="rows"
          @updated="refetch()" />
      </div>
    </client-only>
  </section>
</template>

<script>
import _get from 'lodash/get'
import adminDiscussionList from '@/apollo/queries/adminDiscussionList'
import adminDiscussionListPageCount from '@/apollo/queries/adminDiscussionListPageCount'
import AdminDiscussionList from '@/components/admin/AdminDiscussionList'
import AdminMenu from '@/components/admin/AdminMenu'
import Pagination from '@/components/layout/Pagination'

export default {
  layout (context) {
    return `default-${context.app.$env.EDITOR_STYLE}`
  },
  middleware: 'authenticatedAdmin',
  components: {
    AdminDiscussionList,
    AdminMenu,
    Pagination
  },
  data () {
    return {
      rows: [],
      orderBy: ['UPDATED_AT_DESC'],
      pageSize: 10,
      discussionsCount: 0
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
    }
  },
  apollo: {
    discussions: {
      query: adminDiscussionList,
      variables () {
        const vars = {
          first: this.pageSize,
          offset: (this.page - 1) * this.pageSize
        }
        if (this.orderBy.length) {
          vars.orderBy = this.orderBy
        }
        return vars
      },
      result ({ data, loading }) {
        if (!loading) {
          this.rows = _get(data, 'discussions.nodes', [])
        }
      },
      fetchPolicy: 'cache-and-network',
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    },
    count: {
      query: adminDiscussionListPageCount,
      result ({ data, loading }) {
        if (!loading) {
          this.discussionsCount = _get(data, 'count.nodes.length', 0)
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
      title: this.$headTitle('Discussions Management - Admin')
    }
    return h
  }
}
</script>
