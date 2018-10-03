<template>
  <section class="container">

    <nuxt-link
      :to="{ name: 'discussions-new', query: { iri: 'http://example.org/foo' } }"
      class="button is-link">
      New Thread
    </nuxt-link>

    <discussions-list
      :discussions="discussions.nodes" />

  </section>
</template>

<script>
import allDiscussions from '@/apollo/queries/allDiscussions'
import DiscussionsList from '@/components/DiscussionsList.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  components: {
    DiscussionsList
  },
  data: () => ({
    discussions: {
      nodes: []
    }
  }),
  async created () {
    await datasetsSetup(this.$store)
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
