<template>
  <div class="vote-box">
    <div class="vote-cell">
      <button
        @click.prevent="vote(threadId, 'UPVOTE')"
        :class="{ 'is-info': userVote === 'UPVOTE' }"
        title="Upvote this proposal"
        class="button is-large">
        <thumb-up-outline />
      </button>
      {{ upvotes }}
    </div>

    <div class="vote-cell">
      <button
        @click.prevent="vote(threadId, 'DOWNVOTE')"
        :class="{ 'is-dark-info': userVote === 'DOWNVOTE' }"
        title="Downvote this proposal"
        class="button is-large">
        <thumb-down-outline />
      </button>
      {{ downvotes }}
    </div>
  </div>
</template>

<script>
import voteMutation from '@/apollo/mutations/vote'
import userVote from '@/apollo/queries/userVote'
import votesOnThread from '@/apollo/queries/votesOnThread'
import ThumbUpOutline from 'vue-material-design-icons/ThumbUpOutline.vue'
import ThumbDownOutline from 'vue-material-design-icons/ThumbDownOutline.vue'

export default {
  name: 'Vote',
  components: {
    ThumbUpOutline,
    ThumbDownOutline
  },
  props: {
    threadId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      upvotes: 0,
      neutrals: 0,
      downvotes: 0,
      userVote: 'NEUTRAL'
    }
  },
  methods: {
    async vote (threadId, voteType) {
      if (this.userVote === voteType) {
        // user had voted X and is clicking X again => cancel vote
        voteType = 'NEUTRAL'
      }
      const variables = {
        threadId,
        voteType
      }
      try {
        await this.$apollo.mutate({ mutation: voteMutation, variables })
        await Promise.all([
          this.$apollo.queries.userVote.refetch(),
          this.$apollo.queries.tally.refetch()
        ])
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
      }
    }
  },
  apollo: {
    userVote: {
      prefetch: true,
      variables () {
        return {
          threadId: parseInt(this.threadId, 10)
        }
      },
      query: userVote,
      result ({ data, loading }) {
        this.userVote = data.userVote
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    },
    tally: {
      prefetch: true,
      fetchPolicy: 'no-cache',
      variables () {
        return {
          threadId: parseInt(this.threadId, 10)
        }
      },
      query: votesOnThread,
      result ({ data, loading }) {
        if (data.tally) {
          this.upvotes = data.tally.upvotes
          this.neutrals = data.tally.neutrals
          this.downvotes = data.tally.downvotes
        }
      },
      pollInterval: process.server ? null : 1000 * 30,
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    }
  }
}
</script>
