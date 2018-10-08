<template>
  <li>
    <router-link
      :to="{ path: tree.path }"
      :class="{ 'is-active': isActive, 'is-current': isCurrent }">
      <span
        v-if="couldHaveChildren">
        <span
          v-if="tree.children && tree.children.length"
          class="icon is-small"
          @click.prevent="toggleCollapse">
          <i
            v-show="showMinusSymbol"
            class="mdi mdi-minus" />
          <i
            v-show="showPlusSymbol"
            class="mdi mdi-plus" />
        </span>
        <span
          v-else
          class="icon is-small">
          <i class="mdi" />
        </span>
      </span>
      {{ tree.label }}
    </router-link>

    <ul
      v-if="tree.children && tree.children.length"
      v-show="isActive">
      <object-node
        v-for="node in tree.children"
        :key="node.iri"
        :tree="node"
        :could-have-children="!!tree.children.find((node) => node.children.length > 0)"
        :current-iri="currentIri" />
    </ul>
  </li>
</template>

<script>
export default {
  name: 'ObjectNode',
  props: {
    tree: {
      type: Object,
      required: true
    },
    currentIri: {
      type: String,
      required: true
    },
    // This node has children or has siblings that have children.
    // This is needed to decide whether we render a sublist that has a mix of
    // parents and leafs or leafs-only sublist
    couldHaveChildren: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      isCurrentRoute: this.currentIri === this.tree.iri,
      collapsed: null, // initial state
      hasActiveChild: !!this.tree.children.find((node) => node.iri === this.currentIri)
    }
  },
  computed: {
    isActive () {
      if (this.collapsed === null) {
        if (this.hasActiveChild) {
          return true
        }
        return this.isCurrentRoute
      }
      return !this.collapsed
    },
    isCurrent () {
      return this.isCurrentRoute || this.hasActiveChild
    },
    showMinusSymbol () {
      if (this.collapsed === null) {
        return this.isActive || this.isCurrent
      }

      return !this.collapsed
    },
    showPlusSymbol () {
      return !this.showMinusSymbol
    }
  },
  beforeCreate () {
    this.$options.components.ObjectNode = this.constructor
  },
  methods: {
    toggleCollapse (evt) {
      evt.preventDefault()
      evt.stopPropagation()
      if (this.collapsed === null && !this.isCurrent) {
        this.collapsed = this.isCurrentRoute
      } else {
        this.collapsed = !this.collapsed
      }
    }
  }
}
</script>

<style scoped>
li {
  cursor: pointer;
}
</style>
