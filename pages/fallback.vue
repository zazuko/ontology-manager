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
import JsonLdSerializer from 'rdf-serializer-jsonld'
import Readable from 'readable-stream'
import Structure from '~/components/Structure'
import { datasetsSetup } from '~/libs/utils'
const datasetBaseUrl = require('~/trifid/trifid.config.json').datasetBaseUrl

export default {
  created () {
    datasetsSetup(this.$store)
  },
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
  validate ({ params, store }) {
    // check that either the ontology or the structure contains this IRI
    const ontology = store.state.graph.ontology
    const structureTree = store.state.graph.structureTree
    const iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')

    // we arrived here by navigating from another page
    if (typeof ontology.find === 'function' &&
        (ontology.find(({subject}) => subject.termType === 'NamedNode' && subject.value === iri) ||
        structureTree.hasOwnProperty(iri))) {
      return true
    }

    // we arrived here by loading the page, it's an entry page
    if (ontology.match(rdf.namedNode(iri)).length || structureTree.hasOwnProperty(iri)) {
      return true
    }

    // triggers a 404
    return false
  }
}

function quadsToReadable (quads) {
  const readable = new Readable()
  readable._readableState.objectMode = true
  readable._read = () => {
    quads.forEach((quad) => { readable.push(quad) })
    readable.push(null)
  }
  return readable
}

async function find (ontology, structure, iri) {
  // match the URL with the ontology dataset
  let matched = ontology.match(rdf.namedNode(iri))
  if (matched.length) {
    // if found, serialize to JSONLD to hide it into the HTML
    const jsonLdSerializer = new JsonLdSerializer({
      process: [{flatten: true}, {compact: true}, {outputFormat: 'string'}]
    })
    const stream = jsonLdSerializer.import(quadsToReadable(matched))

    let result
    stream.on('data', (data) => {
      result = data
    })
    await rdf.waitFor(stream)

    return {
      iri,
      jsonld: result
    }
  }

  // match the URL with the structure dataset
  matched = structure.match(rdf.namedNode(iri))
  if (matched.length) {
    return {
      iri,
      jsonld: ''
    }
  }

  return false
}

</script>
