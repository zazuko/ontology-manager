<template>
  <section class="container">
    <button
      class="button"
      @click="paf">paf</button>
  </section>
</template>

<script>
import axios from 'axios'
import _get from 'lodash/get'
import { datasetsSetup } from '@/libs/utils'

export default {
  async asyncData ({ query }) {
    return {
      iri: query.iri
    }
  },
  middleware: 'authenticated',
  async created () {
    await datasetsSetup(this.$store)
  },
  methods: {
    async paf () {
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        const result = await axios.post('/api/proposals/new', { iri: this.iri }, headers)

        const id = _get(result, 'createThread.thread.id')
        if (id) {
          this.$router.push({ name: 'proposals-id', params: { id } })
        } else {
          console.error('Failed to redirect', result)
        }
      } catch (err) {
        console.error(err)
      }
    }
  },
  validate ({ query }) {
    return !!query.iri
  }
}
</script>
