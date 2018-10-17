<template>
  <section class="container">
    <div class="tabs is-boxed is-large">
      <ul>
        <li class="is-active">
          <nuxt-link :to="{ name: 'admin-proposal' }">
            Proposals
          </nuxt-link>
        </li>
        <li>
          <nuxt-link :to="{ name: 'admin-discussion' }">
            Discussions
          </nuxt-link>
        </li>
      </ul>
    </div>

    <admin-proposal-list
      :proposals="discussions.nodes"
      @updated="refetch()" />

  </section>
</template>

<script>
import allDiscussions from '@/apollo/queries/adminWorklist'
import AdminProposalList from '@/components/AdminProposalList.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminProposalList
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
