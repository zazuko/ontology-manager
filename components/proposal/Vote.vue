<template>
  <div class="vote-box">
    <div class="vote-cell">
      <button
        @click.prevent="vote(threadId, 'UPVOTE')"
        :class="{ 'is-info': userVote === 'UPVOTE' }"
        class="button is-large">
        <span class="icon is-large">
          <i class="mdi mdi-24px mdi-thumb-up-outline" />
        </span>
      </button>
      {{ upvotes }}
    </div>

    <div class="vote-cell">
      <button
        @click.prevent="vote(threadId, 'DOWNVOTE')"
        :class="{ 'is-dark-info': userVote === 'DOWNVOTE' }"
        class="button is-large">
        <span class="icon is-large">
          <i class="mdi mdi-24px mdi-thumb-down-outline" />
        </span>
      </button>
      {{ downvotes }}
    </div>
  </div>
</template>

<script>
import voteMutation from '@/apollo/mutations/vote'
import userVote from '@/apollo/queries/userVote'
import votesOnThread from '@/apollo/queries/votesOnThread'

export default {
  name: 'Vote',
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
      pollInterval: 1000 * 30
    }
  }
}
</script>
