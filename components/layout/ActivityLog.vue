<template>
  <div>
    <img
      class="hoverable-icon"
      src="~/assets/images/ic-activity.svg"
      @click="toggle()">

    <div
      v-show="show"
      style="
        display: block;
        position: absolute;
        width: 500px;
        top: 90px;
        right: 0;
        z-index: 1000;
        background-color: white;
        border: 2px solid black;
        padding-right: 20px;
        padding-left: 20px;
        padding-bottom: 10px;
      ">
      <h2>Activity List</h2>

      <div v-show="!items.length">
        No activity yet.
      </div>
      <div
        v-show="items.length"
        style="
          max-height: 740px;
          height: auto;
          overflow: auto;
        ">
        <span
          class="delete"
          @click="toggle(false)" />
        <div
          v-for="item in items"
          :key="item.id">

          <p class="image is-48x48">
            <img
              class="is-rounded"
              :src="item.author.avatar"
              :alt="authorsAvatar(item.author.name)">
          </p>

          {{ item.author.name }}

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

          <span>{{ item.eventDate | formatTime }}</span>
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
