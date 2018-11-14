<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Conversation
      </h1>
      <h2 class="subtitle">
        On <code>{{ discussion.iri }}</code>
      </h2>
      <div class="box">
        <discussion-card :discussion="discussion" />
      </div>
      <div class="box">
        <discussion-reply
          :id="id"
          @answerAdded="answerAdded()" />
      </div>
    </div>
  </section>
</template>

<script>
import discussionById from '@/apollo/queries/discussionById'
import { toastClose } from '@/libs/utils'
import DiscussionCard from '@/components/discussion/DiscussionCard.vue'
import DiscussionReply from '@/components/discussion/DiscussionReply.vue'
import { emptyDiscussion } from '@/libs/fixtures'

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
  data () {
    return {
      discussion: emptyDiscussion
    }
  },
  apollo: {
    discussion: {
      prefetch: true,
      query: discussionById,
      variables () {
        return {
          id: this.id || this.$route.params.id
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
