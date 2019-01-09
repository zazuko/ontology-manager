<template>
  <div class="container layout-objects-list">
    <loader :show-if="!localUserRegistrationDone">
      <p class="subtitle">Preparing the Editor</p>
    </loader>

    <section class="container layout-objects-list-head">
      <h1 class="main-title">
        ontology-editor
      </h1>
      <h2 class="subtitle">
        RDF ontology/schema editor
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
import Loader from '@/components/layout/Loader'

import Auth from '@/mixins/auth'

export default {
  layout: 'background',
  extends: Auth,
  components: {
    StructureHome,
    Loader
  },
  data () {
    return {
      children: _get(this, '$store.state.graph.structureTree[0].children', [])
    }
  }
}
</script>
