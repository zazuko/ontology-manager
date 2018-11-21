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
              <article class="tile is-child class-box">
                <!-- TODO: add 'Last update' -->
                <!-- cf. https://imgur.com/a/37ucgoS -->
                <img src="~/assets/images/ic-document-white.svg" alt="Pouch icon" title="Pouch icon">
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
                  Propert{{ child.properties.length === 1 ? 'y' : 'ies' }}
                  <br>
                  {{ child.properties.length }}
                </p>
              </article>
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
  methods: {
    arrayToGroups
  }
}
</script>
