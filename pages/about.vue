<template>
  <div class="container layout-objects-list">
    <section class="container layout-objects-list-head">
      <h1 class="main-title">
        ontology-editor
      </h1>
      <h2 class="subtitle">
        RDF ontology/schema editor
      </h2>

      <div class="columns">
        <div class="column">
          <p>Zazuko Ontology Manager v{{ version }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { version } from '@/package.json'

export default {
  layout: 'background',
  components: {},
  data () {
    return {
      version
    }
  }
}
</script>
