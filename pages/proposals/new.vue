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

export default {
  async asyncData () {},
  middleware: 'authenticated',
  methods: {
    async paf () {
      const headers = {headers: {authorization: `Bearer ${this.$apolloHelpers.getToken()}`}}
      const result = await axios.post('/api/proposals/new', {}, headers)

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
