<template>
  <div class="activity-log">
    <div class="field">
      <p class="control">
        <!-- TODO: icons should be configurable -->
        <img
          class="hoverable-icon"
          src="~/assets/images/swiss/ic-activity.svg"
          @click="toggle()">
      </p>
    </div>

    <div
      v-show="show"
      class="navbar-dropdown">
      <div class="activity-log-header level">
        <h2 class="level-left">Activity List</h2>
        <span
          class="level-right icon is-medium"
          title="Cancel"
          @click="toggle(false)">
          <i class="mdi mdi-close" />
        </span>
      </div>

      <div
        class="activity-log-empty-state"
        v-show="!items.length">
        No activity yet.
      </div>

      <div
        v-show="items.length"
        class="activity-log-content">
        <div
          class="media"
          v-for="item in items"
          :key="item.id">

          <div class="media-left">
            <figure class="image is-32x32">
              <img
                class="is-rounded"
                :src="item.author.avatar"
                :alt="authorsAvatar(item.author.name)">
            </figure>
          </div>

          <div class="media-content">
            <span class="activity-author">
              {{ item.author.name }}
            </span>

            <span v-if="item.actionType === 'PROPOSAL_SUBMIT'">
              submitted the proposal
              <nuxt-link :to="{ name: 'proposal-id', params: { id: item.thread.id } }">
                {{ item.thread.headline }}
              </nuxt-link>
            </span>
            <span v-else-if="item.actionType === 'PROPOSAL_ACCEPT'">
              accepted the proposal
              <nuxt-link :to="{ name: 'proposal-id', params: { id: item.thread.id } }">
                {{ item.thread.headline }}
              </nuxt-link>
            </span>
            <span v-else-if="item.actionType === 'PROPOSAL_REJECT'">
              rejected the proposal
              <nuxt-link :to="{ name: 'proposal-id', params: { id: item.thread.id } }">
                {{ item.thread.headline }}
              </nuxt-link>
            </span>
            <span v-else-if="item.actionType === 'CONVERSATION_CREATE'">
              created a conversation
              <nuxt-link :to="{ name: 'discussion-id', params: { id: item.thread.id } }">
                {{ item.thread.headline }}
              </nuxt-link>
              on
              <nuxt-link :to="{ path: $rebaseIRI(item.thread.iri) }">
                {{ term(item.thread.iri) }}
              </nuxt-link>
            </span>
            <span v-else-if="item.actionType === 'CONVERSATION_COMMENT'">
              left a comment on conversation
              <nuxt-link :to="{ name: 'discussion-id', params: { id: item.thread.id } }">
                {{ item.thread.headline }}
              </nuxt-link>
              on
              <nuxt-link :to="{ path: $rebaseIRI(item.thread.iri) }">
                {{ term(item.thread.iri) }}
              </nuxt-link>
            </span>
            <span v-else />

            <span class="activity-date">{{ item.eventDate | formatTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import activityLog from '@/apollo/queries/activityLog'
import { term } from '@/libs/utils'

const actionTypes = [
  'PROPOSAL_SUBMIT',
  'PROPOSAL_ACCEPT',
  'PROPOSAL_REJECT',
  'CONVERSATION_CREATE',
  'CONVERSATION_COMMENT'
]

export default {
  name: 'ActivityLog',
  data () {
    return {
      interval: null,
      show: false,
      logs: null
    }
  },
  computed: {
    items () {
      if (this.logs) {
        return this.logs.lines.filter(({ actionType } = {}) => actionTypes.includes(actionType))
      }
      return []
    }
  },
  methods: {
    term,
    authorsAvatar (name = '') {
      return `${name}'s avatar`
    },
    toggle (state) {
      if (state) {
        this.show = state
      }
      else {
        this.show = !this.show
      }
    }
  },
  mounted () {
    if (this.$store.state.config.setup) {
      return
    }
    let interval = 300
    if (this.$auth && this.$auth.$state.loggedIn) {
      interval = 45
    }
    this.interval = setInterval(() => {
      this.$apollo.queries.logs.refetch()
    }, interval * 1000)
  },
  beforeDestroy () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  },
  apollo: {
    logs: {
      query: activityLog,
      fetchPolicy: 'no-cache',
      result ({ data, loading }) {
        if (!loading) {
          this.logs = data.logs
        }
      },
      skip () {
        return this.$store.state.config.setup || !this.$store.state.authProcessDone
      }
    }
  }
}
</script>
