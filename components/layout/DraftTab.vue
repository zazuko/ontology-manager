<template>
  <span>
    <nuxt-link
      v-if="loggedIn"
      :to="{ name: 'proposal-drafts', params: {} }">
      Drafts
      <span
        v-if="counter"
        class="tag is-info">
        {{ counter }}
      </span>
      <span v-else />
    </nuxt-link>
    <span v-else />
  </span>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const {
  mapGetters: draftsGetters
} = createNamespacedHelpers('drafts')

export default {
  name: 'DraftTab',
  data () {
    return {
      personId: undefined
    }
  },
  watch: {
    personId () {
      this.$store.dispatch('drafts/LOAD')
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
  computed: {
    ...draftsGetters(['drafts']),
    loggedIn () {
      const loggedIn = this.$auth && this.$auth.$state.loggedIn
      return loggedIn
    },
    counter () {
      return this.drafts.length
    }
  }
}
</script>
