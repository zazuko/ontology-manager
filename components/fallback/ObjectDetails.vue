<template>
  <section class="section">
    <article>
      <nav class="breadcrumb">
        <ul
          v-for="(breadcrumb, index) in breadcrumbs"
          :key="index">
          <li
            v-for="item in breadcrumb"
            :key="item.target">
            <nuxt-link :to="{ path: item.target }">
              {{ item.label }}
            </nuxt-link>
          </li>
          <li>
            <a href="#">
              {{ label(iri, ontology) }}
            </a>
          </li>
        </ul>
      </nav>

      <h1 class="title is-1">
        {{ label(iri, ontology) }}

        <template v-if="$auth && $auth.$state.loggedIn">
          <nuxt-link
            v-if="isClass"
            id="proposal-change-object"
            :to="{ name: 'proposal-class', query: { iri: iri.value, edit: true } }"
            class="title-edit-button">
            <img
              class="hoverable-icon"
              src="~/assets/images/ic-edit.svg"
              alt="Edit class"
              title="Edit class">
          </nuxt-link>
          <nuxt-link
            v-else-if="isProperty"
            id="proposal-change-object"
            :to="{ name: 'proposal-property', query: { iri: iri.value, edit: true } }"
            class="title-edit-button">
            <img
              class="hoverable-icon"
              src="~/assets/images/ic-edit.svg"
              alt="Edit property"
              title="Edit property">
          </nuxt-link>
          <span v-else />
        </template>
      </h1>

      <div class="content">
        <ul class="goto-nav">
          <li><a href="#proposals">Proposals</a></li>
          <li><a href="#conversations">Conversation</a></li>
        </ul>

        <div v-show="comment">
          <p class="title is-2">Description</p>
          <p>
            {{ comment }}
          </p>
        </div>

        <div v-show="description">
          <p class="title is-3">Long Description</p>
          <p>
            {{ description }}
          </p>
        </div>
      </div>

      <template v-if="isClass">
        <properties-table
          v-if="properties.length"
          :properties="properties"
          :ontology="ontology"
          :structure="structure" />
        <template
          v-else
          class="content">
          <p>
            This class does not have any properties.
          </p>
        </template>
      </template>

      <template v-else>
        <section
          class="content"
          v-show="rangeOf.length">
          <h4 class="title is-2">
            Values are of types
          </h4>
          <ul class="types-list">
            <li
              v-for="clss in rangeOf"
              :key="clss.value">
              <link-to-iri :term="clss" />
            </li>
          </ul>
        </section>
        <section
          class="content"
          v-show="usedOn.length">
          <h4 class="title is-2">
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
        <section
          class="content"
          v-show="sameAs.length">
          <h4 class="title is-2">
            Same As
          </h4>
          <p class="title-url is-size-7">
            http://www.w3.org/2002/07/owl#equivalentProperty
          </p>
          <ul class="types-list">
            <li
              v-for="sameAsIRI in sameAs"
              :key="sameAsIRI">
              <a
                v-if="$unPrefix(sameAsIRI)"
                :href="$rebaseIRI(sameAsIRI)">
                {{ $unPrefix(sameAsIRI) }}
              </a>
              <a
                v-else
                :href="$rebaseIRI(sameAsIRI)">
                {{ sameAsIRI }}
              </a>
            </li>
          </ul>
        </section>
      </template>
      <section
        v-show="examples.length"
        id="example">
        <h2 class="title is-2">
          Example{{ examples.length > 1 ? 's' : '' }}
        </h2>
        <div>
          <pre
            v-for="(example, index) in examples"
            :key="index">{{ example }}</pre>
        </div>
      </section>
    </article>
  </section>
</template>

<script>
import _get from 'lodash/get'
import rdf from 'rdf-ext'
import PropertiesTable from './PropertiesTable'
import LinkToIri from './LinkToIri'
import cloneDeep from 'lodash/cloneDeep'
import { term } from '@/libs/utils'

export default {
  name: 'ObjectDetails',
  components: {
    PropertiesTable,
    LinkToIri
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
  data () {
    return {
      bothDatasets: undefined
    }
  },
  computed: {
    iri () {
      const iri = _get(this.object.toArray(), '[0].subject', { value: '' })
      return iri
    },
    comment () {
      const commentQuad = this.ontology.match(this.iri, this.$termIRI.comment).toArray()
      return _get(commentQuad, '[0].object.value', '')
    },
    description () {
      const descriptionQuad = this.ontology.match(this.iri, this.$termIRI.description).toArray()
      return _get(descriptionQuad, '[0].object.value', '')
    },
    properties () {
      if (this.isClass) {
        const properties = this.$findClassProperties(this.iri.value, this.ontology).toArray()
        return properties
      }

      return null
    },
    usedOn () {
      const classes = this.$usedOnClasses(this.iri.value, this.ontology)
      return classes.map(({ object }) => {
        return {
          label: this.label(object, this.ontology),
          url: this.$rebaseIRI(object.value)
        }
      })
    },
    rangeOf () {
      const classes = this.$rangeOf(this.iri.value, this.ontology)
      return classes
    },
    sameAs () {
      const sameAs = this.ontology.match(this.iri, this.$termIRI.sameAs)
        .toArray()
        .map((quad) => _get(quad.object, 'value'), '')
        .filter(Boolean)
      return sameAs
    },
    examples () {
      return this.ontology.match(this.iri, this.$termIRI.example)
        .toArray()
        .map((quad) => term(quad.object))
    },
    isClass () {
      return Boolean(this.ontology.match(this.iri, this.$termIRI.a, this.$termIRI.Class).toArray().length)
    },
    isProperty () {
      return Boolean(this.ontology.match(this.iri, this.$termIRI.a, this.$termIRI.Property).toArray().length)
    },
    breadcrumbs () {
      this.init()
      const structureTree = cloneDeep(this.$store.state.graph.structureTree)

      if (this.isProperty) {
        const parents = this.findPropertyParents(this.iri)
        return parents.map((parent) => {
          const path = []
          let child = this.findInTree(parent.iri, structureTree[0])
          if (!child) {
            return ''
          }
          while (child.parent) {
            const label = this.label(rdf.namedNode(child.iri), this.bothDatasets)
            const target = this.$rebaseIRI(child.iri)
            path.push({ label, target })
            child = child.parent
          }
          path.reverse()
          return path
        })
      }
      else if (this.isClass) {
        const path = []
        let child = this.findInTree(this.iri.value, structureTree[0])
        if (!child) {
          return ''
        }
        while (child.parent) {
          const label = this.label(rdf.namedNode(child.iri), this.bothDatasets)
          const target = this.$rebaseIRI(child.iri)
          path.push({ label, target })
          child = child.parent
        }
        path.reverse()
        path.pop()
        return [path]
      }
      return ''
    }
  },
  methods: {
    init () {
      if (!this.bothDatasets) {
        this.bothDatasets = this.ontology.merge(this.structure)
      }
    },
    label (iri, dataset) {
      const label = dataset.match(iri, this.$termIRI.label).toArray()
      return _get(label, '[0].object.value', '')
    },
    findInTree (iri, tree) {
      for (const child of tree.children) {
        child.parent = tree
        if (child.iri === iri) {
          return child
        }
        const found = this.findInTree(iri, child)
        if (found) {
          return found
        }
      }
    },
    findPropertyParents (iri) {
      return this.ontology.match(iri, this.$termIRI.domain)
        .toArray()
        .map(({ object }) => {
          const label = this.label(object, this.bothDatasets)
          const target = this.$rebaseIRI(object.value)
          return { iri: object.value, label, target }
        })
    }
  }
}
</script>
