<template>
  <section class="container">

    <nuxt-link
      :to="{ name: 'discussion-new', query: { iri: 'http://example.org/foo' } }"
      class="button is-link">
      New Thread
    </nuxt-link>

    <discussions-list
      :discussions="discussions.nodes"/>

  </section>
</template>

<script>
import gql from 'graphql-tag'
import DiscussionsList from '~/components/DiscussionsList.vue'

export default {
  components: {
    DiscussionsList
  },
  data: () => ({
    discussions: {
      discussions: []
    }
  }),
  apollo: {
    discussions: {
      query: gql` query GetAllDiscussions {
        discussions: allThreads {
          nodes {
            id,
            headline,
            body,
            hat: hatByHatId {
              title
            },
            author: personByAuthorId {
              name
            },
            iri,
            threadType,
            authorId,
            externalId
          }
        }
      }`,
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
