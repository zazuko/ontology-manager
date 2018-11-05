<template>
  <div class="container">
    <section
      v-if="iri"
      class="main-content columns is-fullheight">
      <script
        v-if="jsonld"
        id="data"
        type="application/ld+json"
        v-html="jsonld" />

      <side-nav :current-iri="iri" />

      <div class="container column is-10">
        <div
          v-if="subtree"
          class="section">

          <structure
            :obj="subtree"
            :name="subtree.label"
            class="tile is-ancestor" />

          <proposals
            :iri="iri"
            :is-class="isClass()" />

          <discussions
            v-if="isClass()"
            :iri="iri" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import rdf from 'rdf-ext'
import JsonLdSerializer from 'rdf-serializer-jsonld-ext'

import Structure from '@/components/Structure'
import SideNav from '@/components/SideNav'
import Discussions from '@/components/Discussions'
import Proposals from '@/components/Proposals'
import { datasetsSetup, findSubtreeInForest } from '@/libs/utils'
import { termIRI } from '@/libs/rdf'

const datasetBaseUrl = require('@/trifid/trifid.config.json').datasetBaseUrl

export default {
  async asyncData ({ route, store }) {
    const params = route.params
    let iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')
    if (route.path.endsWith('/')) {
      iri += '/'
    }
    let jsonld = ''

    try {
      jsonld = await new Promise((resolve, reject) => {
        const dataset = matched(store, iri)
        if (!dataset) resolve()
        const quadStream = rdf.graph(dataset).toStream()

        const serializer = new JsonLdSerializer({ outputFormat: 'string', compact: true })

        const jsonStream = serializer.import(quadStream)

        jsonStream.on('error', (err) => {
          reject(err)
        })
        jsonStream.on('data', (jsonld) => {
          resolve(jsonld)
        })
        jsonStream.on('end', () => {
          resolve()
        })
      })
    } catch (err) {
      console.error(err)
    }

    return {
      iri,
      jsonld
    }
  },
  components: {
    SideNav,
    Structure,
    Discussions,
    Proposals
  },
  computed: {
    subtree () {
      const structureTree = this.$store.state.graph.structureTree
      const tree = findSubtreeInForest(structureTree, this.iri)
      return tree
    }
  },
  async created () {
    await datasetsSetup(this.$store)
  },
  data () {
    return {
      ontology: undefined
    }
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        this.ontology = window.ontology
        clearInterval(i)
      }
    })
  },
  methods: {
    isClass () {
      if (this.ontology) {
        const subject = rdf.namedNode(this.iri)
        const classesFound = this.ontology.match(subject, termIRI.a, termIRI.Class).toArray().length
        return Boolean(classesFound)
      }
      return false
    }
  },
  validate ({ params, store, route }) {
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
    let iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')

    // we don't have access to asyncData in here
    if (route.path.endsWith('/')) {
      iri += '/'
    }

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

function matched (store, iri) {
  const subject = rdf.namedNode(iri)

  // 1. const dataset = resourceToGraph(…)
  // 2. const foo = dataset.match(null, null, null, rdf.namedNode(req.iri))
  // 3. -> jsonld

  if (process.client) {
    if (window.structure) {
      const foundInOntology = window.ontologyGraph.match(null, null, null, subject)
      if (foundInOntology.toArray().length) {
        return foundInOntology
      }
      const foundInStructure = window.structureGraph.match(null, null, null, subject)
      return foundInStructure
    }
  }
  if (process.server) {
    const foundInOntology = store.state.graph.ontologyGraph.match(null, null, null, subject)
    if (foundInOntology.toArray().length) {
      return foundInOntology
    }
    const foundInStructure = store.state.graph.structureGraph.match(null, null, null, subject)
    return foundInStructure
  }
  return false
}
</script>
