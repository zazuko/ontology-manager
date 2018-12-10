<template>
  <div class="container">
    <div class="layout-conversation">
      <div class="section">
        <nav
          class="breadcrumb">
          <ul>
            <li>
              <a href="#">
                item 1
              </a>
            </li>
            <li>
              <a href="#">
                item 2
              </a>
            </li>
            <li>
              <a href="#">
                conversation
              </a>
            </li>
          </ul>
        </nav>

        <discussion-create :iri="iri" />
      </div>
    </div>
  </div>
</template>

<script>
import _get from 'lodash/get'
import DiscussionCreate from '@/components/discussion/DiscussionCreate.vue'

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
