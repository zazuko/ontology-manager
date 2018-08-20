<template>
  <section class="container">
    <discussion-card :discussion="discussion" />
  </section>
</template>

<script>
import _get from 'lodash/get'
import gql from 'graphql-tag'
import DiscussionCard from '~/components/DiscussionCard.vue'

export default {
  async asyncData (context) {
    const id = _get(context, 'params.id')
    if (!id) {
      return context.error({
        statusCode: 404,
        message: 'Missing `id` parameter'
      })
    }
    return {
      id
    }
  },
  middleware: 'authenticated',
  components: {
    DiscussionCard
  },
  data: () => ({
    discussion: {
      author: {
        name: ''
      }
    }
  }),
  apollo: {
    discussion: {
      query: gql` query GetDiscussion ($id: Int!) {
        discussion: threadById (id: $id) {
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
      }`,
      variables () {
        return {
          id: this.id
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
