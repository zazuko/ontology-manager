<template>
  <section class="container">
    <discussion-create _iri="http://example.com/foo" />
  </section>
</template>

<script>
import DiscussionCreate from '~/components/DiscussionCreate.vue'

export default {
  middleware: 'authenticated',
  components: {
    DiscussionCreate
  }
}
</script>
