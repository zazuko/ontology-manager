<template>
  <section class="container">
    <div class="layout-conversation">
      <div class="section">
        <template v-if="canReply && iriTerm">
          <nav
            class="breadcrumb">
            <ul>
              <li>
                <link-to-iri :term="iriTerm" />
              </li>
            </ul>
          </nav>
        </template>

        <div class="discussion">
          <discussion-card
            v-if="discussion"
            :discussion="discussion"
            @refreshDiscussion="refreshDiscussion" />
        </div>
        <client-only
          v-if="canReply">
          <discussion-reply
            :id="id"
            class="discussion"
            @answerAdded="refreshDiscussion" />
        </client-only>
      </div>
    </div>
  </section>
</template>

<script>
import _get from 'lodash/get'
import rdf from 'rdf-ext'
import discussionById from '@/apollo/queries/discussionById'
import { toastClose } from '@/libs/utils'
import DiscussionCard from '@/components/discussion/DiscussionCard'
import DiscussionReply from '@/components/discussion/DiscussionReply'
import LinkToIri from '@/components/fallback/LinkToIri'
import { emptyDiscussion } from '@/libs/fixtures'

export default {
  layout (context) {
    return `default-${context.app.$env.EDITOR_STYLE}`
  },
  components: {
    DiscussionCard,
    DiscussionReply,
    LinkToIri
  },
  computed: {
    iriTerm () {
      if (this.discussion && this.discussion.iri) {
        return rdf.namedNode(this.discussion.iri)
      }
      return false
    },
    canReply () {
      return process.browser && _get(this, '$auth.$state.loggedIn', false) && this.$store.state.authProcessDone
    }
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
      },
      skip () {
        return !this.$store.state.authProcessDone
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
