<template>
  <div>
    <p class="menu-label">
      {{ tree.label }}
    </p>
    <ul
      class="menu-list">
      <object-node
        v-for="node in tree.children"
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
