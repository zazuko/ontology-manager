<template>
  <div class="tile is-vertical is-12">
    <div class="tile is-parent">
      <article
        :id="iriToId(object.iri)"
        class="tile is-child container-box">
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
                :iri="child.iri"
                :properties-count="childPropertiesCount(child)"
                :classes-count="childClassesCount(child)"
                :modified="child.modified"
                :type="child.type"
                class="" />
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import _get from 'lodash/get'
import { cloneDeep } from 'lodash'
import { hasCreativeWorkChild, arrayToGroups, iriToId } from '@/libs/utils'
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
    iriToId,
    hasCreativeWorkChild,
    arrayToGroups,
    childPropertiesCount (obj) {
      if (obj.hasOwnProperty('childPropertiesCount')) {
        return obj.childPropertiesCount
      }
      const properties = childPropertiesCount(obj)
        .reduce((tmp, p) => {
          tmp[p.subject.value] = true
          return tmp
        }, {})
      const count = Object.keys(properties).length
      obj.childPropertiesCount = count
      return count
    },
    childClassesCount (obj, sum = 0, recursing = false) {
      if (obj.hasOwnProperty('childClassesCount')) {
        return obj.childClassesCount
      }
      let count
      if (_get(obj, 'children.length', false)) {
        const childCount = obj.children.reduce((acc, child) => this.childClassesCount(child, acc, true), sum)
        count = (obj.type === 'class' ? 1 : 0) + childCount
      }
      else {
        count = sum + (obj.type === 'class' ? 1 : 0)
      }
      if (!recursing) {
        obj.childClassesCount = count
      }
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
