<template>
  <li>
    <nuxt-link
      :to="{ path: tree.path }"
      :class="{ 'is-active': isActive, 'is-current': isCurrent }">
      <span
        v-if="couldHaveChildren">
        <span
          v-if="children && children.length"
          class="icon is-small"
          @click.prevent="toggleCollapse">
          <minus v-show="showMinusSymbol" />
          <plus v-show="showPlusSymbol" />
        </span>
      </span>
      <span
        v-else-if="properties.length"
        class="icon is-small"
        @click.prevent="toggleCollapse">
        <minus v-show="showMinusSymbol" />
        <plus v-show="showPlusSymbol" />
      </span>
      <span
        v-else
        class="icon is-small has-text-grey-lighter"
        @click.prevent="">
        <plus />
      </span>
      <span>
        {{ tree.label || $getTerm(tree.iri) }}
      </span>
    </nuxt-link>

    <ul
      v-if="children && children.length"
      v-show="isActive">
      <object-node
        v-for="node in children"
        :key="node.iri"
        :tree="node"
        :could-have-children="!!children.find((node) => node.children.length > 0)"
        :current-iri="currentIri" />
    </ul>
    <div v-else>
      <ul
        v-if="properties && properties.length"
        v-show="isActive">
        <li
          v-for="(property, index) in properties"
          :key="index">
          <link-to-iri
            :term="property.subject"
            :link-class="{ 'is-current': sameIRI(property.subject.value) }" />
        </li>
      </ul>
      <ul v-else />
    </div>
  </li>
</template>

<script>
import LinkToIri from '../LinkToIri'
import Minus from 'vue-material-design-icons/Minus.vue'
import Plus from 'vue-material-design-icons/Plus.vue'

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
  components: {
    LinkToIri,
    Minus,
    Plus
  },
  data () {
    return {
      collapsed: null // initial state
    }
  },
  computed: {
    children () {
      return this.tree.children.filter((node) => node.isCreativeWork)
    },
    hasActiveChild () {
      const childClasses = !!this.children.find((node) => node.iri === this.currentIri)
      if (childClasses) {
        return true
      }
      return Boolean(this.findPropertyInChildren(this.tree))
    },
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
    isCurrentRoute () {
      if (this.currentIri !== this.tree.iri) {
        if (this.properties && this.properties.length) {
          return !!this.properties.find(({ subject }) => subject.value === this.currentIri)
        }
        return false
      }
      return true
    },
    showMinusSymbol () {
      if (this.collapsed === null) {
        return this.isActive || this.isCurrent
      }

      return !this.collapsed
    },
    showPlusSymbol () {
      return !this.showMinusSymbol
    },
    properties () {
      if (Array.isArray(this.tree.properties)) {
        return this.tree.properties
      }
      if (this.tree.properties) {
        return this.tree.properties.toArray()
      }
      return []
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
      }
      else {
        this.collapsed = !this.collapsed
      }
    },
    sameIRI (iri) {
      return this.currentIri === iri
    },
    findPropertyInChildren (tree) {
      const properties = Array.isArray(tree.properties) ? tree.properties : tree.properties.toArray()
      if (properties.find(({ subject }) => subject.value === this.currentIri)) {
        return true
      }

      if (Array.isArray(tree.children)) {
        let found = false
        tree.children.forEach((child) => {
          if (this.findPropertyInChildren(child)) {
            found = true
          }
        })
        return found
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
