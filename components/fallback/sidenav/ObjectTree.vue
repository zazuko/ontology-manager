<template>
  <div>
    <p class="menu-label">
      {{ tree.label || $getTerm(tree.iri) }}
    </p>
    <ul
      class="menu-list">
      <object-node
        v-for="node in tree.children.filter((node) => node.isCreativeWork)"
        :key="node.iri"
        :tree="node"
        :could-have-children="true"
        :current-iri="currentIri" />
    </ul>
  </div>
</template>

<script>
import ObjectNode from './ObjectNode'

export default {
  name: 'ObjectTree',
  components: {
    ObjectNode
  },
  props: ['tree', 'item', 'currentIri']
}
</script>
