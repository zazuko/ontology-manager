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
      v-for="(tree, index) in children"
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
import _get from 'lodash/get'
import rdf from 'rdf-ext'

import Structure from '@/components/fallback/Structure'

export default {
  layout: 'background',
  components: {
    Structure
  },
  mounted () {
    this.ontology = this.$store.getters['graph/ontology']
    this.structure = this.$store.getters['graph/structure']

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
      objectType: 'container',
      ontology: rdf.dataset(),
      structure: rdf.dataset(),
      children: _get(this, '$store.state.graph.structureTree', [])
    }
  }
}
</script>
