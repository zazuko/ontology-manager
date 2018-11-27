<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        {{ name }}: Logistics objects
      </h1>
      <article class="tile is-child container-box">
        <div class="content">
          <div
            v-for="(group, index) in arrayToGroups(obj)"
            :key="index"
            class="tile is-ancestor">
            <div
              v-for="child in group"
              :key="child.path"
              class="tile is-parent is-3">
              <pouch-box
                :label="child.label"
                :to="{ path: child.path, params: {} }"
                :properties-count="_get(child, 'properties.length', 0)"
                class="" />
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
import rdf from 'rdf-ext'
import { arrayToGroups } from '@/libs/utils'
import PouchBox from './PouchBox'
import _get from 'lodash/get'

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
    ontology: {
      type: Object,
      required: true,
      default: () => rdf.dataset()
    },
    structure: {
      type: Object,
      required: true,
      default: () => rdf.dataset()
    },
    isClass: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: {
    PouchBox
  },
  methods: {
    _get,
    arrayToGroups
  }
}
</script>
