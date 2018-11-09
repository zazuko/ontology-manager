<template>
  <div>
    <section
      v-for="child in tree.children"
      :key="child.lvl"
      class="container"
      style="margin-bottom: 25px;">
      <structure
        :obj="child"
        :name="child.lvl" />
    </section>
  </div>
</template>

<script>
// import rdf from 'rdf-ext'
import Structure from '@/components/fallback/Structure'

export default {
  components: {
    Structure
  },
  // async asyncData (context) {
  //   if (process.server) {
  //     const dataset = context.req.structure
  //     const x = dataset.match(
  //       null,
  //       rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
  //       rdf.namedNode('http://www.w3.org/2002/07/owl#Class')
  //     )
  //     console.log(x.map(a => a.subject))
  //   }
  //   return {}
  // }
  data () {
    // console.log(typeof window !== 'undefined' && window.ontology.match())
    return {
      tree: this.$store.state.graph.structureTree
    }
  }
}
</script>
