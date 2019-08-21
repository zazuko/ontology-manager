<template>
  <div>
    <table class="table admin-table">
      <thead>
        <tr>
          <th>
            Title
          </th>
          <th>
            Created by
          </th>
          <th>
            <a
              class="sort-by"
              @click.prevent="sort('UPDATED_AT')">
              Last updated
              <span class="sort-icon">
                <menu-down v-if="orderBy['UPDATED_AT'] === 'ASC'" />
                <menu-up v-else-if="orderBy['UPDATED_AT'] === 'DESC'" />
                <menu-swap v-else />
              </span>
            </a>
          </th>
          <th>
            <div
              class="dropdown"
              :class="{ 'is-active': statusDropdown }">
              <div class="dropdown-trigger">
                <button
                  aria-haspopup="true"
                  aria-controls="dropdown-menu"
                  @click.prevent="statusDropdown = true">
                  <span>Status</span>
                  <span class="sort-icon">
                    <menu-down />
                  </span>
                </button>
              </div>
              <div
                class="dropdown-menu"
                role="menu">
                <div class="dropdown-content">
                  <a
                    class="dropdown-item"
                    :class="{ 'is-active': statusFilter === 'all' }"
                    @click.prevent="filterStatus('all')">
                    All
                  </a>
                  <hr class="dropdown-divider">
                  <a
                    class="dropdown-item"
                    :class="{ 'is-active': statusFilter === 'open' }"
                    @click.prevent="filterStatus('open')">
                    Open
                  </a>
                  <a
                    class="dropdown-item"
                    :class="{ 'is-active': statusFilter === 'resolved' }"
                    @click.prevent="filterStatus('resolved')">
                    Resolved
                  </a>
                  <a
                    class="dropdown-item"
                    :class="{ 'is-active': statusFilter === 'rejected' }"
                    @click.prevent="filterStatus('rejected')">
                    Rejected
                  </a>
                  <a
                    class="dropdown-item"
                    :class="{ 'is-active': statusFilter === 'hidden' }"
                    @click.prevent="filterStatus('hidden')">
                    Hidden
                  </a>
                </div>
              </div>
            </div>
          </th>
          <th>
            Votes
          </th>
          <th class="is-hidden-mobile">
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="proposal in rows"
          :key="proposal.id">
          <td>
            <p>
              <nuxt-link :to="{ name: 'proposal-id', params: { id: proposal.id } }">
                {{ proposal.headline }}
              </nuxt-link>
              <a
                v-for="externalLink in externalLinksFor(proposal)"
                :key="externalLink"
                :href="externalLink"
                class="is-link"
                target="_blank"
                title="Show commit">
                <open-in-new />
              </a>
            </p>
            <p>
              <span class="info">on {{ proposal.iri }}</span>
            </p>
          </td>
          <td>
            {{ proposal.author.name }}
          </td>
          <td>
            <p>
              {{ proposal.updatedAt|formatDate }}
            </p>
            <p>
              <span class="info">
                (Created: {{ proposal.createdAt|formatDate }})
              </span>
            </p>
          </td>
          <td>
            <p>
              {{ proposal.status }}
            </p>
            <p>
              <span class="info">
                {{ proposal.proposalType }}
              </span>
            </p>
          </td>
          <td>
            <div class="votes">
              <div class="vote-cell">
                <thumb-up-outline />
                {{ proposal.tally.upvotes }}
              </div>
              <div class="vote-cell">
                <thumb-down-outline />
                {{ proposal.tally.downvotes }}
              </div>
            </div>
          </td>
          <td class="has-text-right is-hidden-mobile">
            <span
              v-if="!proposal.isDraft">
              <p>
                <button
                  class="button is-small is-info"
                  :disabled="proposal.status !== 'OPEN'"
                  @click.prevent="approve(proposal)">
                  Approve
                </button>
                <button
                  class="button is-small is-dark-info"
                  :disabled="proposal.status !== 'OPEN'"
                  @click.prevent="reject(proposal)">
                  Reject
                </button>
                <button
                  class="button is-small is-grey is-outlined"
                  :disabled="proposal.status !== 'OPEN'"
                  @click.prevent="hide(proposal)">
                  Delete
                </button>
              </p>
            </span>
            <span v-else>
              <nuxt-link
                v-if="proposal.proposalType === 'Class'"
                :to="{ name: 'proposal-id', params: { id: proposal.id } }"
                class="button is-small is-info">
                See
              </nuxt-link>
              <nuxt-link
                v-if="proposal.proposalType === 'Property'"
                :to="{ name: 'proposal-id', params: { id: proposal.id } }"
                class="button is-small is-info">
                See
              </nuxt-link>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <loader :show-if="working">
      <p class="subtitle">Working…</p>
    </loader>
  </div>
</template>

<script>
import axios from 'axios'
import { toastClose } from '@/libs/utils'
import Loader from '@/components/layout/Loader'
import OpenInNew from 'vue-material-design-icons/OpenInNew.vue'
import ThumbUpOutline from 'vue-material-design-icons/ThumbUpOutline.vue'
import ThumbDownOutline from 'vue-material-design-icons/ThumbDownOutline.vue'
import MenuSwap from 'vue-material-design-icons/MenuSwap.vue'
import MenuDown from 'vue-material-design-icons/MenuDown.vue'
import MenuUp from 'vue-material-design-icons/MenuUp.vue'

export default {
  name: 'AdminProposalList',
  props: {
    proposals: {
      type: Array,
      required: true,
      default () {
        return []
      }
    }
  },
  components: {
    Loader,
    OpenInNew,
    MenuSwap,
    MenuDown,
    MenuUp,
    ThumbUpOutline,
    ThumbDownOutline
  },
  computed: {
    rows () {
      return this.proposals.map((proposal) => {
        proposal.tally = this.tally(proposal.votesByThreadId.votes)
        proposal.proposalType = this.$proposalType(proposal.proposalObject)
        return proposal
      })
    }
  },
  data () {
    return {
      working: false,
      statusDropdown: false,
      statusFilter: 'open',
      orderBy: {
        ID: false,
        HEADLINE: false,
        AUTHOR_ID: false,
        HAT_ID: false,
        THREAD_TYPE: false,
        UPDATED_AT: 'DESC',
        STATUS: false
      }
    }
  },
  mounted () {
    this.filterStatus(this.statusFilter)
  },
  methods: {
    async approve ({ id, proposalType }) {
      this.working = true
      try {
        const store = proposalType === 'Property' ? 'prop' : 'class'
        await this.$store.dispatch(`${store}/APPROVE`, {
          token: this.$apolloHelpers.getToken(),
          threadId: id
        })
        this.working = false
        this.$emit('updated', id)
        this.$store.dispatch('graph/RELOAD_DATASET')
        this.$toast.success('Proposal approved!', toastClose).goAway(1600)
      }
      catch (err) {
        this.working = false
        console.error(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose).goAway(1600)
        this.$sentry.captureException(err)
      }
    },
    async reject (proposal, status = 'REJECTED') {
      this.working = true
      const body = {
        threadId: proposal.id,
        status
      }
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        await axios.post('/api/proposal/close', body, headers)
        this.working = false
        this.$emit('updated', proposal.id)
        this.$toast.success('Proposal rejected!', toastClose).goAway(1600)
      }
      catch (err) {
        this.working = false
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose).goAway(1600)
      }
    },
    async hide (proposal, status = 'HIDDEN') {
      this.working = true
      const body = {
        threadId: proposal.id,
        status
      }
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        await axios.post('/api/proposal/close', body, headers)
        this.working = false
        this.$emit('updated', proposal.id)
        this.$toast.success('Proposal deleted!', toastClose).goAway(1600)
      }
      catch (err) {
        this.working = false
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error(`Error: ${err.response.data.message || err.message}`, toastClose).goAway(1600)
      }
    },
    tally (votes = []) {
      return votes.reduce((acc, { vote } = {}) => {
        switch (vote) {
          case 'UPVOTE':
            acc.upvotes += 1
            break
          case 'NEUTRAL':
            acc.neutrals += 1
            break
          case 'DOWNVOTE':
            acc.downvotes += 1
            break
        }
        return acc
      }, { upvotes: 0, neutrals: 0, downvotes: 0 })
    },
    sort (key) {
      if (this.orderBy[key]) {
        const opposite = this.orderBy[key] === 'ASC' ? 'DESC' : 'ASC'
        this.orderBy[key] = opposite
      }
      else {
        this.orderBy[key] = 'DESC'
      }
      const filters = Object.entries(this.orderBy)
        .filter(([key, val]) => val)
        .map(([key, val]) => `${key}_${val}`)
      this.$emit('sort', filters)
    },
    filterStatus (status) {
      this.statusFilter = status
      this.statusDropdown = false
      this.$emit('status-filter', status)
    },
    externalLinksFor (proposal) {
      // externalId can be `null`
      if (proposal.externalId) {
        return proposal.externalId.split(' ')
      }
      return []
    }
  }
}
</script>
