<template>
  <div class="activity-log">
    <div class="field">
      <p class="control">
        <img
          class="hoverable-icon"
          src="~/assets/images/ic-activity.svg"
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

      <div v-show="!items.length">
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
              <nuxt-link :to="{ path: rebaseIRI(item.thread.iri) }">
                {{ term(item.thread.iri) }}
              </nuxt-link>
            </span>
            <span v-else-if="item.actionType === 'CONVERSATION_COMMENT'">
              left a comment on conversation
              <nuxt-link :to="{ name: 'discussion-id', params: { id: item.thread.id } }">
                {{ item.thread.headline }}
              </nuxt-link>
              on
              <nuxt-link :to="{ path: rebaseIRI(item.thread.iri) }">
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
import { term, rebaseIRI } from '@/libs/rdf'

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
    rebaseIRI,
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
  apollo: {
    logs: {
      prefetch: true,
      query: activityLog,
      result ({ data, loading }) {
        this.logs = data.logs
      },
      pollInterval: 1000 * 31
    }
  }
}
</script>
