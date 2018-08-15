<template>
  <section class="container">
    <discussions-list
      :threads="allThreads.threads"/>
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
    allThreads: []
  }),
  apollo: {
    allThreads: {
      query: gql`{
        allThreads {
          threads: nodes {
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
      }`
    }
  }
}
</script>
