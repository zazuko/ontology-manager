<template>
  <section class="container">
    <div class="tabs is-boxed is-large">
      <ul>
        <li>
          <nuxt-link :to="{ name: 'admin-proposal' }">
            Proposals
          </nuxt-link>
        </li>
        <li class="is-active">
          <nuxt-link :to="{ name: 'admin-discussion' }">
            Discussions
          </nuxt-link>
        </li>
      </ul>
    </div>

    <admin-discussion-list
      :discussions="discussions.nodes"
      @updated="refetch()" />

  </section>
</template>

<script>
import allDiscussions from '@/apollo/queries/adminWorklist'
import AdminDiscussionList from '@/components/AdminDiscussionList.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  middleware: 'authenticatedAdmin',
  components: {
    AdminDiscussionList
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
