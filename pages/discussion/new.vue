<template>
  <section class="container">
    <discussion-create :_iri="iri" />
  </section>
</template>

<script>
import DiscussionCreate from '~/components/DiscussionCreate.vue'
import _get from 'lodash/get'

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
  }
}
</script>
