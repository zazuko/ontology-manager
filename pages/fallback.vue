<template>
  <div>

    <h1>{{ _iri }}</h1>

    <script
      v-if="_jsonld"
      id="data"
      type="application/ld+json"
      v-html="_jsonld" />

  </div>
</template>

<script>
import rdf from 'rdf-ext'
import JsonLdSerializer from 'rdf-serializer-jsonld'
import Readable from 'readable-stream'
import Structure from '~/components/Structure'
const datasetBaseUrl = require('~/trifid/trifid.config.json').datasetBaseUrl

export default {
  components: {
    Structure
  },
  async asyncData (context) {
    if (process.server) {
      const data = find(context.req.ontology, context.req.structure, context.iri)
      if (data) {
        return data
      }

      // nothing found so far, send 404
      context.error({statusCode: 404, message: 'Not Found'})
    }
  },
  data () {
    if (typeof window !== 'undefined' && window.ontology) {
      const data = find(window.ontology, window.structure, this._iri)
      if (data) {
        return data
      }
    }
    return {}
  },
  computed: {
    tree () {
      return this.$store.state.graph.structureTree[this.iri]
    },
    _iri () {
      if (this.iri) return this.iri
      const params = this.$route.params
      return datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')
    },
    _jsonld () {
      if (this.jsonld) return this.jsonld
      return ''
    }
  },
  validate ({ params, store }) {
    const ontology = store.state.graph.ontology
    const structureTree = store.state.graph.structureTree
    const iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')
    if (typeof ontology.find === 'function') {
      if (
        ontology.find(({subject}) => subject.termType === 'NamedNode' && subject.value === iri) ||
        structureTree.hasOwnProperty(iri)
      ) {
        return true
      }
    } else if (
      ontology.match(rdf.namedNode(iri)).length ||
      structureTree.hasOwnProperty(iri)
    ) {
      return true
    }
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
