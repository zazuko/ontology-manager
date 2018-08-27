<template>
  <section class="container">
    <button
      class="button"
      @click="paf">paf</button>
  </section>
</template>

<script>
import axios from 'axios'

export default {
  async asyncData () {},
  middleware: 'authenticated',
  methods: {
    async paf () {
      const headers = {headers: {authorization: `Bearer ${this.$apolloHelpers.getToken()}`}}
      const result = await axios.post('/api/proposals/new', {}, headers)
        .then(() => {
          console.log('success', result)
        })
        .catch((err) => {
          console.error(err)
        })
      // this.api.createBranch()
      //   .then(async ({name} = {}) => {
      //     await this.api.updateFile({
      //       path: 'ontology.nt',
      //       message: `test ${Math.round(Math.random() * 100000)}`,
      //       content: Buffer.from(`test ${Math.round(Math.random() * 100000)}`).toString('base64'),
      //       branch: name,
      //       author: {
      //         name: 'API Attribution Test',
      //         email: 'victor.felder@zazuko.com',
      //         date: (new Date()).toISOString()
      //       }
      //     })
      //     await this.api.updateFile({
      //       path: 'ontology.nt',
      //       message: `test ${Math.round(Math.random() * 100000)}`,
      //       content: Buffer.from(`test ${Math.round(Math.random() * 100000)}`).toString('base64'),
      //       branch: name,
      //       author: {
      //         name: 'API Attribution Test',
      //         email: 'victor.felder@zazuko.com',
      //         date: (new Date()).toISOString()
      //       }
      //     })
      //     await this.api.updateFile({
      //       path: 'ontology.nt',
      //       message: `test ${Math.round(Math.random() * 100000)}`,
      //       content: Buffer.from(`test ${Math.round(Math.random() * 100000)}`).toString('base64'),
      //       branch: name,
      //       author: {
      //         name: 'API Attribution Test',
      //         email: 'victor.felder@zazuko.com',
      //         date: (new Date()).toISOString()
      //       }
      //     })
      //   })
      //   .then((x) => {
      //     // console.log(x, JSON.stringify(x, null, 2))
      //   })
    }
  }
}
</script>
