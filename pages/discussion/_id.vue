<template>
  <section class="container">
    <discussion-card :discussion="discussion" />
    <discussion-reply :id="id" />
  </section>
</template>

<script>
import _get from 'lodash/get'
import gql from 'graphql-tag'
import DiscussionCard from '~/components/DiscussionCard.vue'
import DiscussionReply from '~/components/DiscussionReply.vue'

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
      id: parseInt(id, 10)
    }
  },
  middleware: 'authenticated',
  components: {
    DiscussionCard,
    DiscussionReply
  },
  data: () => ({
    discussion: {}
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
          externalId,
          answers: messagesByThreadId {
            messages: nodes {
              id,
              body,
              author: personByAuthorId {
                name
              }
            }
          }
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
