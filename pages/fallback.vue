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
      const dataset = context.req.dataset
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
  },
  data () {
    const foo = '{"@context":{"@vocab":"http://schema.org/"},"@id":"http://tcftest.org/schema/ShippersInstruction","@type":"http://www.w3.org/2002/07/owl#Class","http://purl.org/dc/terms/modified":{"@type":"http://www.w3.org/2001/XMLSchema#date","@value":"2017-11-16"},"http://tcftest.org/schema/classStatus":{"@id":"http://tcftest.org/schema/Draft"},"http://tcftest.org/schema/example":"# A shippers instruction in real life\\n\\n```\\n@prefix tcf <http://localhost:8080/schema/> .\\n@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\\n\\n<instruction> a tcf:ShippersInstruction ;\\n  rdfs:label \\"This is a shippers instruction\\" .\\n```\\n","http://www.w3.org/2000/01/rdf-schema#comment":"Need a good definition. Here is one from shippingsolutions.com - The Shipper\'s Letter of Instruction helps to convey specific instructions from the exporter to his agent, usually an international freight forwarder.","http://www.w3.org/2000/01/rdf-schema#label":"Shippers Instruction","http://www.w3.org/2000/01/rdf-schema#subClassOf":{"@id":"http://tcftest.org/schema/LogisticsObject"}}'
    return {
      foo
    }
  }
}
</script>
