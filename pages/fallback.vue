<template>
  <div>

    <h1>{{ iri }}</h1>

    <script
      v-if="jsonld"
      id="data"
      type="application/ld+json"
      v-html="jsonld" />

    <section
      class="container"
      style="margin-bottom: 25px;">
      <structure
        v-if="subtree"
        :obj="subtree"
        :name="subtree.label" />
    </section>
  </div>
</template>

<script>
import rdf from 'rdf-ext'
import Structure from '~/components/Structure'
import { datasetsSetup, findSubtreeInForest } from '~/libs/utils'

const datasetBaseUrl = require('~/trifid/trifid.config.json').datasetBaseUrl

export default {
  components: {
    Structure
  },
  computed: {
    subtree () {
      const structureTree = this.$store.state.graph.structureTree
      const tree = findSubtreeInForest(structureTree, this.iri)
      return tree
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
    let structure
    if (typeof window !== 'undefined' && window.ontology) {
      // we arrived here by navigating from another page
      ontology = window.ontology
      structure = window.structure
    } else {
      // we arrived here by loading the page, it's an entry page
      ontology = store.state.graph.ontology
      structure = store.state.graph.structure
    }

    // when trifid cannot find the IRI in the dataset, the request goes through
    // nuxt but without `req.dataset`, which means the store is empty and here
    // is our chance to send a 404
    if (typeof ontology.match !== 'function') {
      return false
    }

    // check that either the ontology or the structure contains this IRI
    const iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')

    if (ontology.match(rdf.namedNode(iri)).toArray().length) {
      return true
    }

    if (structure.match(rdf.namedNode(iri)).toArray().length) {
      return true
    }

    // triggers a 404
    return false
  }
}
</script>
