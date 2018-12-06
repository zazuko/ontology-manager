<template>
  <div class="container">
    <section class="section">
      <!--
      TODO: why this placeholder URL query? is this index page used at all?
      It's supposed to be a public list of all discussion threads, I don't think
      it was planned…
      -->
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

export default {
  components: {
    DiscussionList
  },
  data: () => ({
    discussions: {
      nodes: []
    }
  }),
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
