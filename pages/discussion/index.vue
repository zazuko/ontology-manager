<template>
  <div class="container">
    <section class="section">
      <nuxt-link
        :to="{ name: 'discussion-new', query: { iri: 'http://example.org/foo' } }"
        class="button is-link">
        New Thread
      </nuxt-link>

      <discussion-list
        :discussions="discussions.nodes" />
    </section>
  </div>
</template>

<script>
import allDiscussions from '@/apollo/queries/allDiscussions'
import DiscussionList from '@/components/discussion/DiscussionList.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  components: {
    DiscussionList
  },
  data: () => ({
    discussions: {
      nodes: []
    }
  }),
  async created () {
    await datasetsSetup(this.$store)
  },
  mounted () {
    // triggers the error
    this.$apollo.queries.discussions.refetch()
  },
  apollo: {
    discussions: {
      prefetch: true,
      query: allDiscussions,
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
