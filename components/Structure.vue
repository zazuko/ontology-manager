<template>
  <div
    :class="{
      'is-ancestor': Object.keys(parent).length === 0,
      [color]: true
    }"
    class="tile notification">
    <div
      :class="{
        'is-child': Boolean(Object.keys(parent).length),
        'is-parent': true || Boolean(obj.children && obj.children.length)
      }"
      class="tile is-vertical">

      <p class="title">
        <nuxt-link
          v-if="obj.path"
          :to="{ path: obj.path, params: {} }">
          {{ name }}
        </nuxt-link>
        <span
          v-else>
          {{ name }}
        </span>
      </p>

      <structure
        v-for="child in obj.children"
        :key="child.iri"
        :obj="child"
        :parent="obj"
        :name="child.label"
        :depth="depth + 1"
        class="is-child" />
    </div>
  </div>
</template>

<script>
const depths = [
  'is-warning',
  'is-danger',
  'is-primary',
  'is-info'
]

export default {
  name: 'Structure',
  props: {
    name: {
      type: String,
      required: true
    },
    obj: {
      type: Object,
      required: false,
      default: () => ({})
    },
    parent: {
      type: Object,
      required: false,
      default: () => ({})
    },
    depth: {
      type: Number,
      required: false,
      default: 0
    }
  },
  data () {
    return {
      color: depths[this.depth]
    }
  }
}
</script>
