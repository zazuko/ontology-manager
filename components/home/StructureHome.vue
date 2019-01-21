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
        <!--<p
          class="subtitle">
          {{ childClassesCount(object) }} Logistics Object{{ childClassesCount(object) === 1 ? '' : 's' }}
          <br>
          {{ childPropertiesCount(object) }} Propert{{ childPropertiesCount(object) === 1 ? 'y' : 'ies' }}
        </p>-->

        <div
          v-if="hasCreativeWorkChild(object)"
          class="content">
          <div
            v-for="(group, index) in arrayToGroups(object)"
            :key="index"
            class="tile is-ancestor object-tiles">
            <div
              v-for="child in group"
              :key="child.path"
              class="tile is-parent object-tile">
              <pouch-box
                :label="child.label"
                :to="{ path: child.path, params: {} }"
                :iri="child.iri"
                :properties-count="0"
                :classes-count="childClassesCount(child)"
                :modified="child.modified"
                :type="child.type" />
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import { hasCreativeWorkChild, arrayToGroups, iriToId, childClassesCount } from '@/libs/utils'
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
    childClassesCount
  }
}
</script>
