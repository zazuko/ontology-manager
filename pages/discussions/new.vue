<template>
  <section class="container">
    <discussion-create :iri="iri" />
  </section>
</template>

<script>
import _get from 'lodash/get'
import DiscussionCreate from '@/components/DiscussionCreate.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  async asyncData (context) {
    const iri = _get(context, 'query.iri')
    if (!iri) {
      return context.error({
        statusCode: 404,
        message: 'Missing `iri` query parameter'
      })
    }
    return {
      iri
    }
  },
  middleware: 'authenticated',
  components: {
    DiscussionCreate
  },
  async created () {
    await datasetsSetup(this.$store)
  }
}
</script>
