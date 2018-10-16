<template>
  <div>
    <section class="container">
      <h1 class="title">
        ontology-editor
      </h1>
      <h2 class="subtitle">
        Semantic Web, RDF ontology editor
      </h2>

      <div class="columns">
        <div class="column">
          <p>
            One-to-one frictionless standards-compliant tagclouds matrix transparent strategic applications action-items leverage. Authentic ubiquitous transform." Embedded, benchmark brand: integrate visualize e-commerce, citizen-media Cluetrain unleash systems turn-key applications? Integrate redefine networks niches user-centred aggregate harness whiteboard.
          </p>
        </div>
        <div class="column">
          <p>
            Web services interfaces efficient A-list e-commerce web services e-business syndicate, "innovate one-to-one methodologies architect eyeballs," web services: enable networking bandwidth enterprise. Social reintermediate, harness wireless target vortals vertical integrateAJAX-enabled infomediaries revolutionary models experiences, bandwidth.
          </p>
        </div>
      </div>

    </section>

    <section
      v-for="(tree, index) in forest[0].children"
      :key="index"
      class="container"
      style="margin-bottom: 25px;">
      <structure-home
        :obj="tree"
        :name="tree.label" />
    </section>
  </div>
</template>

<script>
import StructureHome from '@/components/StructureHome'
import { datasetsSetup } from '@/libs/utils'

export default {
  components: {
    StructureHome
  },
  data () {
    return {
      forest: this.$store.state.graph.structureTree
    }
  },
  async created () {
    await datasetsSetup(this.$store)
  }
}
</script>
