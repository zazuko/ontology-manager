<template>
  <section class="section has-background-white">
    <article>
      <h1 class="title is-1">
        {{ name }}
      </h1>
      <div class="content">
        <p>
          <a href="#conversations">Conversation</a>
        </p>
        <p>
          {{ comment }}
        </p>
      </div>

      <div v-if="isClass">
        <properties-table
          v-if="obj.properties.length"
          :properties="obj.properties.toArray()"
          :ontology="ontology"
          :structure="structure" />
        <div
          v-else
          class="content">
          <p>
            This class does not have any properties.
          </p>
        </div>
      </div>
      <div v-else />
    </article>
  </section>
</template>

<script>
import _get from 'lodash/get'
import rdf from 'rdf-ext'
import PropertiesTable from './PropertiesTable'
import { commentQuadForIRI } from '@/libs/rdf'

export default {
  name: 'ObjectDetails',
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
  computed: {
    comment () {
      const quad = commentQuadForIRI(this.ontology, this.obj.iri)
      return _get(quad, 'object.value', '')
    }
  }
}
</script>
