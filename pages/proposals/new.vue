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
  async asyncData () {},
  middleware: 'authenticated',
  async created () {
    await datasetsSetup(this.$store)
  },
  methods: {
    async paf () {
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      const result = await axios.post(
        '/api/proposals/new',
        {
          iri: 'http://example.com/schema/FlightManifest'
        },
        headers
      )

      const id = _get(result, 'createThread.thread.id')
      if (id) {
        this.$router.push({ name: 'proposals-id', params: { id } })
      } else {
        console.error('Failed to redirect', result)
      }
    }
  }
}
</script>
