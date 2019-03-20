<template>
  <div class="container layout-objects-list">
    <section class="container layout-objects-list-head">
      <h1 class="main-title">
        {{ $store.state.config.editor.meta.title }}
      </h1>

      <div class="columns">
        <div
          v-for="(text, index) in $store.state.config.editor.text.home"
          :key="index"
          v-html="text"
          class="column" />
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
      children: _get(this, '$store.state.graph.structureTree', [])
    }
  }
}
</script>
