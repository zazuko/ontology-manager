<template>
  <div>

    <h1>{{ iri }}</h1>

    <script
      v-if="jsonld"
      id="data"
      type="application/ld+json"
      v-html="jsonld" />

  </div>
</template>

<script>
import rdf from 'rdf-ext'
import Structure from '~/components/Structure'
import { datasetsSetup } from '~/libs/utils'

const datasetBaseUrl = require('~/trifid/trifid.config.json').datasetBaseUrl

export default {
  components: {
    Structure
  },
  computed: {
    tree () {
      return this.$store.state.graph.structureTree[this.iri]
    },
    iri () {
      const params = this.$route.params
      return datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')
    },
    jsonld () {
      return ''
    }
  },
  async created () {
    await datasetsSetup(this.$store)
  },
  validate ({ params, store }) {
    let ontology
    if (typeof window !== 'undefined' && window.ontology) {
      // we arrived here by navigating from another page
      ontology = window.ontology
    } else {
      // we arrived here by loading the page, it's an entry page
      ontology = store.state.graph.ontology
    }

    const structureTree = store.state.graph.structureTree

    // check that either the ontology or the structure contains this IRI
    const iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')

    if (ontology.match(rdf.namedNode(iri)).length || structureTree.hasOwnProperty(iri)) {
      return true
    }

    // triggers a 404
    return false
  }
}
</script>
