<template>
  <div
    :class="{
      'is-ancestor': Object.keys(parent || {}).length === 0,
      [color]: true
    }"
    class="tile notification">
    <div
      :class="{
        'is-child': Boolean(Object.keys(parent || {}).length),
        'is-parent': true || Boolean(obj.children && obj.children.length)
      }"
      class="tile is-vertical">

      <h1 class="title">
        <nuxt-link
          v-if="obj.path"
          :to="{ path: obj.path, params: {} }">
          {{ name }}
        </nuxt-link>
        <span
          v-else>
          {{ name }}
        </span>
      </h1>
      <h2
        v-if="true || obj.type === 'class'"
        class="subtitle">
        {{ childClassesCount(obj) }} classes
        <br>
        {{ childPropertiesCount(obj) }} properties
      </h2>

      <div
        v-if="hasCreativeWorkChild(obj)"
        class="is-child">
        <structure-home
          v-for="child in obj.children"
          :key="child.iri"
          :name="child.label"
          :obj="child"
          :parent="obj"
          :depth="depth + 1" />
      </div>
    </div>
  </div>
</template>

<script>
import { hasCreativeWorkChild } from '@/libs/utils'

const depths = [
  'is-warning',
  'is-danger',
  'is-primary',
  'is-info'
]

export default {
  name: 'StructureHome',
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
  },
  methods: {
    hasCreativeWorkChild,
    childPropertiesCount (obj) {
      const properties = childPropertiesCount(obj)
        .reduce((obj, p) => {
          obj[p.subject.value] = true
          return obj
        }, {})
      return Object.keys(properties).length
    },
    childClassesCount (obj, sum = 0) {
      if (obj.children) {
        return (obj.type === 'class' ? 1 : 0) + obj.children.reduce((acc, child) => this.childClassesCount(child, acc), sum)
      }
      return sum + (obj.type === 'class' ? 1 : 0)
    }
  }
}

function childPropertiesCount (obj, properties = []) {
  if (obj.children) {
    const prop = Array.isArray(obj.properties) ? obj.properties : obj.properties.toArray()
    const childProps = obj.children.reduce((acc, child) => childPropertiesCount(child, acc), properties)
    return prop.concat(childProps)
  }
  return obj.properties.toArray()
}

</script>
