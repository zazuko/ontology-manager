<template>
  <aside class="column is-2 is-narrow-mobile is-fullheight section is-hidden-mobile">
    <object-tree
      v-for="tree in structureTree[0].children"
      :key="tree.iri"
      :tree="tree"
      :current-iri="currentIri" />
  </aside>
</template>

<script>
import ObjectTree from '@/components/ObjectTree'

export default {
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
      structureTree: this.$store.state.graph.structureTree
    }
  },
  methods: {
    toggle () {
      this.isActive = !this.isActive
    }
  }
}
</script>
