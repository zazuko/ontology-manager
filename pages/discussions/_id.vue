<template>
  <section class="container">
    <discussion-card :discussion="discussion" />
    <discussion-reply
      :id="id"
      @answerAdded="answerAdded()"/>
  </section>
</template>

<script>
import gql from 'graphql-tag'
import { datasetsSetup, toastClose } from '~/libs/utils'
import DiscussionCard from '~/components/DiscussionCard.vue'
import DiscussionReply from '~/components/DiscussionReply.vue'

export default {
  async asyncData ({ route }) {
    const id = parseInt(route.params.id, 10)

    return {
      id
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
  async created () {
    await datasetsSetup(this.$store)
  },
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
            avatar,
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
      fetchPolicy: 'cache-and-network',
      result ({ data, loading }) {
        if (!loading && data) {
          if (!data.discussion) {
            return this.$router.app.error({
              statusCode: 404,
              message: 'Not found'
            })
          }
        }
      }
    }
  },
  methods: {
    answerAdded () {
      this.$apollo.queries.discussion.refetch()
        .then(() => {
          this.$toast.success('Answer successfully added!', toastClose)
        })
    }
  },
  validate ({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
  }
}
</script>
