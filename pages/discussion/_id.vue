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
            v-if="discussion"
            :discussion="discussion"
            @refreshDiscussion="refreshDiscussion" />
          <div v-else />
        </div>
        <div
          v-if="_get($auth, '$state.loggedIn', false)"
          class="discussion">
          <no-ssr>
            <discussion-reply
              :id="id"
              @answerAdded="refreshDiscussion" />
          </no-ssr>
        </div>
        <div v-else />
      </div>
    </div>
  </section>
</template>

<script>
import _get from 'lodash/get'
import discussionById from '@/apollo/queries/discussionById'
import { toastClose } from '@/libs/utils'
import DiscussionCard from '@/components/discussion/DiscussionCard'
import DiscussionReply from '@/components/discussion/DiscussionReply'
import { emptyDiscussion } from '@/libs/fixtures'

export default {
  components: {
    DiscussionCard,
    DiscussionReply
  },
  data () {
    return {
      id: parseInt(this.$route.params.id, 10),
      discussion: emptyDiscussion
    }
  },
  apollo: {
    discussion: {
      query: discussionById,
      prefetch: ({ route }) => {
        return {
          id: parseInt(route.params.id, 10)
        }
      },
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
    _get,
    refreshDiscussion (message) {
      this.$apollo.queries.discussion.refetch()
        .then(() => {
          if (message) {
            this.$toast.success(message, toastClose).goAway(1600)
          }
        })
    }
  },
  validate ({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
  },
  head () {
    const h = {
      title: 'Discussion'
    }
    if (this.discussion) {
      if (this.discussion.headline) {
        h.title += ' ' + this.$headTitle("'" + this.discussion.headline + "'")
      }
      if (this.comment) {
        h.meta = [
          { hid: 'description', name: 'description', content: `Discussion '${this.discussion.headline}' on '${this.discussion.iri}'` }
        ]
      }
    }
    return h
  }
}
</script>
