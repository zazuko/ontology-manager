<template>
  <aside class="column is-3 is-narrow-mobile is-fullheight section is-hidden-mobile side-nav-col">
    <object-tree
      v-for="tree in children"
      :key="tree.iri"
      :tree="tree"
      :current-iri="currentIri" />
  </aside>
</template>

<script>
import _get from 'lodash/get'
import ObjectTree from './ObjectTree'

export default {
  name: 'SideNav',
  components: {
    ObjectTree
  },
  props: {
    currentIri: {
      required: false,
      default: '',
      type: String
    }
  },
  data () {
    return {
      children: _get(this, '$store.state.graph.structureTree[0].children', [])
    }
  },
  methods: {
    toggle () {
      this.isActive = !this.isActive
    }
  }
}
</script>
