<template>
  <div class="container layout-objects-list">
    <section class="container layout-objects-list-head">
      <h1 class="main-title">
        Zazuko Ontology Manager
      </h1>
      <h2 class="subtitle">
        RDF ontology/schema editor
      </h2>

      <ul class="columns">
        <ul class="column">
          <ul>
            <li>
              Zazuko Ontology Manager
              <a
                :href="editorVersionLink"
                target="_blank">v{{ editorVersion }}</a>
            </li>
            <li>
              Ontology Version
              <a
                :href="ontologyLink"
                target="_blank">v{{ ontologyVersion }}</a>
            </li>
          </ul>
        </ul>
      </ul>
    </section>
  </div>
</template>

<script>
import { version } from '@/package.json'

export default {
  layout: 'background',
  async asyncData (app) {
    let version = -1
    if (process.client) {
      try {
        const versionResponse = await app.$axios.$get('/api/version')
        version = versionResponse.version
      }
      catch (err) {
        console.error(err)
      }
    }
    return {
      ontologyVersion: version
    }
  },
  components: {},
  data () {
    return {
      editorVersion: version,
      ontologyVersion: -1
    }
  },
  computed: {
    editorVersionLink () {
      return `https://github.com/zazuko/ontology-manager/tree/v${this.editorVersion}`
    },
    ontologyLink () {
      const { owner, repo, branch } = this.$store.state.config.editor.github
      return `https://github.com/${owner}/${repo}/tree/${branch}`
    }
  }
}
</script>
