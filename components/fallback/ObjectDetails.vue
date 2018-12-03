<template>
  <section class="section has-background-white">
    <article>
      <h1 class="title is-1">
        {{ label(iri) }}

        <nuxt-link
          v-if="isClass"
          :to="{ name: 'proposal-class', query: { iri: iri.value, edit: true } }"
          class="object-edit-button">
          <img
            src="~/assets/images/ic-edit-passive.svg"
            alt="Edit class"
            title="Edit class">
        </nuxt-link>

        <nuxt-link
          v-else-if="isProperty"
          :to="{ name: 'proposal-property', query: { iri: iri.value, edit: true } }"
          class="object-edit-button">
          <img
            src="~/assets/images/ic-edit-passive.svg"
            alt="Edit property"
            title="Edit property">
        </nuxt-link>
        <span v-else />
      </h1>
      <div class="content">
        <ul>
          <li v-show="isClass">Go to <a href="#proposals">Proposals</a></li>
          <li>Go to <a href="#conversations">Conversation</a></li>
        </ul>

        <div v-show="comment">
          <p class="title is-5">Short Description</p>
          <blockquote>
            {{ comment }}
          </blockquote>
        </div>

        <div v-show="description">
          <p class="title is-5">Long Description</p>
          <blockquote>
            {{ description }}
          </blockquote>
        </div>
      </div>

      <div v-if="isClass">
        <properties-table
          v-if="properties.length"
          :properties="properties"
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
      <div v-else>
        <section
          class="content"
          v-show="rangeOf.length">
          <h4 class="title is-5">
            Values are of types
          </h4>
          <ul class="types-list">
            <li
              v-for="clss in rangeOf"
              :key="clss.value">
              <link-to-IRI :term="clss" />
            </li>
          </ul>
        </section>
        <section
          class="content"
          v-show="usedOn.length">
          <h4 class="title is-5">
            Used on types
          </h4>
          <ul class="types-list">
            <li
              v-for="clss in usedOn"
              :key="clss.url">
              <nuxt-link :to="clss.url">
                {{ clss.label }}
              </nuxt-link>
            </li>
          </ul>
        </section>
      </div>
    </article>
  </section>
</template>

<script>
import _get from 'lodash/get'
import rdf from 'rdf-ext'
import PropertiesTable from './PropertiesTable'
import LinkToIRI from './LinkToIRI'
import { termIRI, usedOnClasses, rangeOf, rebaseIRI } from '@/libs/rdf'
import { findClassProperties } from '@/libs/utils'

export default {
  name: 'ObjectDetails',
  components: {
    PropertiesTable,
    LinkToIRI
  },
  props: {
    object: {
      type: Object,
      required: true,
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
    }
  },
  computed: {
    iri () {
      const iri = _get(this.object.toArray(), '[0].subject', { value: '' })
      return iri
    },
    comment () {
      const label = this.ontology.match(this.iri, termIRI.comment).toArray()
      return _get(label, '[0].object.value', '')
    },
    description () {
      const label = this.ontology.match(this.iri, termIRI.description).toArray()
      return _get(label, '[0].object.value', '')
    },
    properties () {
      if (this.isClass) {
        const properties = findClassProperties(this.iri.value, this.ontology).toArray()
        return properties
      }
      return null
    },
    usedOn () {
      const classes = usedOnClasses(this.iri.value, this.ontology)
      return classes.map(({ object }) => {
        return {
          label: this.label(object),
          url: rebaseIRI(object.value)
        }
      })
    },
    rangeOf () {
      const classes = rangeOf(this.iri.value, this.ontology)
      return classes
    },
    isClass () {
      return Boolean(this.ontology.match(this.iri, termIRI.a, termIRI.Class).toArray().length)
    },
    isProperty () {
      return Boolean(this.ontology.match(this.iri, termIRI.a, termIRI.Property).toArray().length)
    }
  },
  methods: {
    label (iri) {
      const label = this.ontology.match(iri, termIRI.label).toArray()
      return _get(label, '[0].object.value', '')
    }
  }
}
</script>
