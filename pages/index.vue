<template>
  <div class="container layout-objects-list">
    <section class="container layout-objects-list-head">
      <h1 class="main-title">
        Ontology Manager
      </h1>

      <div class="columns">
        <div class="column">
          <p>
            The Ontology Manager is based on a web interface and Github for repository functions. It has been created in order
            to enable collaboration on schema definition beyond the developer community and enabling the business process experts
            to engage and drive the creation of the best possible schema for the logistics industry, while ensuring a correct
            schema definition in Turtle (Terse RDF Triple Language) format.
          </p>
        </div>

        <div class="column">
          <p>
            The Ontology Manager consists of the following functions;
          </p>

          <ul class="dash-bullet">
            <li>
              repository of schema in Turtle format (Github)
            </li>
            <li>
              logical visualization of schema
            </li>
            <li>
              forum capability
            </li>
            <li>
              proposal, voting, and acceptance of new schema entries, changes, and deprecation
            </li>
            <li>
              search in all defined schemas
            </li>
            <li>
              activity list view
            </li>
          </ul>

          <p>
            In order to join you will need a Github account.
          </p>
        </div>
      </div>
    </section>

    <section
      v-for="(tree, index) in children"
      :key="index"
      class="container layout-objects-list-item">
      <structure-home
        :obj="tree"
        :name="tree.label"
        class="tile is-ancestor" />
    </section>
  </div>
</template>

<script>
import _get from 'lodash/get'

import StructureHome from '@/components/home/StructureHome'

export default {
  layout: 'background',
  components: {
    StructureHome
  },
  data () {
    return {
      children: _get(this, '$store.state.graph.structureTree[0].children', [])
    }
  }
}
</script>
