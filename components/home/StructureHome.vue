<template>
  <div>
    <div class="tile is-vertical is-12">
      <div class="tile is-parent">
        <article class="tile is-child container-box">
          <p class="title">
            <nuxt-link
              v-if="object.path"
              :to="{ path: object.path, params: {} }">
              {{ name }}
            </nuxt-link>
            <span
              v-else>
              {{ name }}
            </span>
          </p>
          <p
            v-if="true || object.type === 'class'"
            class="subtitle">
            {{ childClassesCount(object) }} Logistics Object{{ childClassesCount(object) === 1 ? '' : 's' }}
            <br>
            {{ childPropertiesCount(object) }} Propert{{ childPropertiesCount(object) === 1 ? 'y' : 'ies' }}
          </p>

          <div
            v-if="hasCreativeWorkChild(object)"
            class="content">
            <div
              v-for="(group, index) in arrayToGroups(object)"
              :key="index"
              class="tile is-ancestor">
              <div
                v-for="child in group"
                :key="child.path"
                class="tile is-parent is-3">
                <pouch-box
                  :label="child.label"
                  :to="{ path: child.path, params: {} }"
                  :properties-count="childPropertiesCount(child)"
                  :classes-count="childClassesCount(child)"
                  :modified="child.modified"
                  class="" />
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import { hasCreativeWorkChild, arrayToGroups } from '@/libs/utils'
import PouchBox from '@/components/fallback/PouchBox'

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
  components: {
    PouchBox
  },
  data () {
    return {
      object: cloneDeep(this.obj)
    }
  },
  methods: {
    hasCreativeWorkChild,
    arrayToGroups,
    childPropertiesCount (obj) {
      if (obj.childPropertiesCount) {
        return obj.childPropertiesCount
      }
      const properties = childPropertiesCount(obj)
        .reduce((obj, p) => {
          obj[p.subject.value] = true
          return obj
        }, {})
      const count = Object.keys(properties).length
      obj.childPropertiesCount = count
      return count
    },
    childClassesCount (obj, sum = 0) {
      if (obj.childClassesCount) {
        return obj.childClassesCount
      }
      let count
      if (obj.children) {
        count = (obj.type === 'class' ? 1 : 0) + obj.children.reduce((acc, child) => this.childClassesCount(child, acc), sum)
      }
      else {
        count = sum + (obj.type === 'class' ? 1 : 0)
      }
      obj.childClassesCount = count
      return count
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
