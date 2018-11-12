<template>
  <div>
    <div class="tile is-vertical is-12">
      <div class="tile is-parent">
        <article class="tile is-child container-box">
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
          <p
            v-if="true || obj.type === 'class'"
            class="subtitle">
            {{ childClassesCount(obj) }} classes
            <br>
            {{ childPropertiesCount(obj) }} properties
          </p>

          <div
            v-if="hasCreativeWorkChild(obj)"
            class="content">
            <div
              v-for="(group, index) in arrayToGroups(obj)"
              :key="index"
              class="tile is-ancestor">
              <div
                v-for="child in group"
                :key="child.path"
                class="tile is-parent is-3">
                <article class="tile is-child class-box">
                  <p class="title">
                    <nuxt-link
                      v-if="child.path"
                      :to="{ path: child.path, params: {} }">
                      {{ child.label }}
                    </nuxt-link>
                    <span
                      v-else>
                      {{ child.label }}
                    </span>
                  </p>
                  <p
                    v-if="true || child.type === 'class'"
                    class="subtitle">
                    {{ childClassesCount(child) }} classes
                    <br>
                    {{ childPropertiesCount(child) }} properties
                  </p>
                </article>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import { hasCreativeWorkChild, arrayToGroups } from '@/libs/utils'

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
    }
  },
  methods: {
    hasCreativeWorkChild,
    arrayToGroups,
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
