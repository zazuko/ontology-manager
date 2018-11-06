<template>
  <span>
    <nuxt-link
      v-if="loggedIn"
      :to="{ name: 'proposal-drafts', params: {} }">
      Drafts
      <span
        v-if="!skipped && counter"
        class="tag is-info">
        {{ counter }}
      </span>
    </nuxt-link>

  </span>
</template>

<script>
import _get from 'lodash/get'
import userDrafts from '@/apollo/queries/userDrafts'

export default {
  name: 'DraftTab',
  computed: {
    loggedIn () {
      const loggedIn = this.$auth && this.$auth.$state.loggedIn
      return loggedIn
    },
    skipped () {
      return !this.loggedIn || !this.personId
    },
    counter () {
      return _get(this, 'proposals.drafts.length', 0)
    }
  },
  data () {
    return {
      personId: 0
    }
  },
  mounted () {
    this.personId = this.$auth.$storage.getState('personId')
    this.$auth.$storage.watchState('personId', (personId) => {
      setTimeout(() => {
        this.personId = personId
      }, 100)
    })
  },
  apollo: {
    proposals: {
      prefetch: false,
      query: userDrafts,
      variables () {
        return {
          authorId: this.personId
        }
      },
      skip () {
        return this.skipped
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
