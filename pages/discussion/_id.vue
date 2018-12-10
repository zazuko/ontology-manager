<template>
  <section class="container">
    <div class="layout-conversation">
      <div class="section">
        <!-- On <code>{{ discussion.iri }}</code> -->
        <!-- TODO: breadcrumb -->
        <!-- <nav
          class="breadcrumb">
          <ul>
            <li>
              <a href="#">
                item 1
              </a>
            </li>
            <li>
              <a href="#">
                item 2
              </a>
            </li>
            <li>
              <a href="#">
                conversation
              </a>
            </li>
          </ul>
        </nav> -->

        <div class="discussion">
          <discussion-card
            :discussion="discussion"
            @refreshDiscussions="refreshDiscussions()" />
        </div>
        <div class="discussion">
          <discussion-reply
            :id="id"
            @answerAdded="refreshDiscussions()" />
        </div>
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
    return {
      id: route.params.id
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
          id: parseInt(this.id || this.$route.params.id, 10)
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
    refreshDiscussions () {
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
