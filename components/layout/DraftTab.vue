<template>
  <nuxt-link
    :to="{ name: 'proposal-drafts', params: {} }">
    Drafts
    <span
      v-show="counter"
      class="tag is-info">
      {{ counter }}
    </span>
  </nuxt-link>
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
    counter () {
      return this.drafts.length
    }
  }
}
</script>
