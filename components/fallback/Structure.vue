<template>
  <div class="tile is-vertical is-12">
    <div class="tile is-parent">
      <article class="tile is-child container-box">
        <h1 class="title">
          {{ _get(obj, 'label') }}: Logistics objects
        </h1>

        <div class="tile is-child container-box">
          <div
            v-if="_get(obj, 'children.length', false)"
            class="content">
            <div
              v-for="(group, index) in arrayToGroups(obj)"
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
                  :properties-count="_get(child, 'properties.length', 0)"
                  :modified="child.modified"
                  :type="child.type" />
              </div>
            </div>
          </div>
          <div
            v-else
            class="content">
            <p>
              This pouch is empty.
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
import { arrayToGroups } from '@/libs/utils'
import PouchBox from './PouchBox'
import _get from 'lodash/get'
import Dataset from 'indexed-dataset/dataset'

export default {
  name: 'Structure',
  props: {
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
      default: () => new Dataset()
    },
    structure: {
      type: Object,
      required: true,
      default: () => new Dataset()
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
