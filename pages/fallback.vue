<template>
  <section class="container">
    <script
      id="data"
      type="application/ld+json"
      v-html="jsonld" />
    <h1>yeah! {{ iri }}</h1>
  </section>
</template>

<script>
import rdf from 'rdf-ext'
import JsonLdSerializer from 'rdf-serializer-jsonld'
import Readable from 'readable-stream'

function quadsToReadable (quads) {
  const readable = new Readable()
  readable._readableState.objectMode = true
  readable._read = () => {
    quads.forEach((quad) => { readable.push(quad) })
    readable.push(null)
  }
  return readable
}

export default {
  async asyncData (context) {
    if (process.server) {
      const dataset = context.req.ontology
      const matched = dataset.match(rdf.namedNode(context.iri))
      if (!matched.length) {
        context.error({statusCode: 404, message: 'Not Found'})
        return
      }

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
        iri: context.iri,
        jsonld: result
      }
    }

    return {
      iri: context.iri
    }
  }
}
</script>
