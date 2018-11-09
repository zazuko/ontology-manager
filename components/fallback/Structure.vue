<template>
  <div>
    <div class="tile is-vertical is-12">
      <div class="tile is-parent">
        <article class="tile is-child notification is-danger">
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
            v-if="obj.type === 'class'"
            class="subtitle">
            {{ obj.properties.length }} properties
          </p>
          <p v-else />

          <properties-table
            v-if="obj.type === 'class' && obj.properties.length"
            :properties="obj.properties"
            :ontology="ontology"
            :structure="structure" />
          <div v-else />

          <div class="content">
            <div
              v-for="(group, index) in arrayToGroups(obj)"
              :key="index"
              class="tile is-ancestor">
              <div
                v-for="child in group"
                :key="child.path"
                class="tile is-parent is-3">
                <article class="tile is-child box notification is-warning">
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
                  <p class="subtitle">
                    {{ child.properties.length }} properties
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
import rdf from 'rdf-ext'
import { arrayToGroups } from '@/libs/utils'
import PropertiesTable from './PropertiesTable'

export default {
  name: 'Structure',
  components: {
    PropertiesTable
  },
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
      default: () => 0
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
    }
  },
  methods: {
    arrayToGroups
  }
}
</script>
