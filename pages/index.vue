<template>
  <div class="container layout-objects-list">
    <section class="container layout-objects-list-head">
      <h1 class="main-title">
        {{ $store.state.config.editor.meta.title }}
      </h1>

      <div class="columns">
        <div
          v-for="(text, index) in $store.state.config.editor.text.home"
          :key="index"
          v-html="text"
          class="column" />
      </div>
    </section>

    <section
      v-for="(tree, index) in structureTree"
      :key="index"
      class="container layout-objects-list-item">
      <structure
        :obj="tree"
        :ontology="ontology"
        :structure="structure"
        :is-class="$termIRI.ClassLikes.includes(objectType.value)" />
    </section>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import Structure from '@/components/fallback/Structure'

const {
  mapGetters: graphGetters
} = createNamespacedHelpers('graph')

export default {
  layout: 'background',
  components: {
    Structure
  },
  computed: {
    ...graphGetters(['ontology', 'structure', 'structureTree'])
  },
  mounted () {
    setTimeout(() => {
      const cookies = document.cookie.split(';')
      if (cookies.length > 1 && this.$store.state.config.setup && process.browser) {
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i]
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
        location.reload()
      }
    }, 1000)
  },
  data () {
    return {
      objectType: 'container'
    }
  }
}
</script>
