<template>
  <div>
    <loader
      v-if="!dataReady"
      :show-if="!dataReady" />
    <div
      v-else-if="iri"
      :class="{
        'layout-objects-list': isObjectList,
        'layout-object-details': isObjectDetails
      }"
      class="container">

      <!-- layout-objects-list -->
      <div
        v-if="$termIRI.creativeWork.equals(objectType)"
        v-show="dataReady">
        <section class="container layout-objects-list-head">
          <h1 class="main-title">
            {{ label }}
          </h1>
          <h2 class="subtitle">
            {{ comment }}
          </h2>
        </section>

        <section
          class="container layout-objects-list-item">
          <structure
            :obj="subtree"
            :ontology="ontology"
            :structure="structure"
            :is-class="$termIRI.ClassLikes.includes(objectType.value)" />
        </section>

        <template
          v-if="!hasChildContainers(subtree)">
          <section
            class="container layout-objects-list-item">
            <class-proposals
              id="proposals"
              :iri="iri" />
          </section>
        </template>
      </div>

      <!-- layout-object-details -->
      <div
        v-else
        v-show="dataReady"
        class="columns">
        <aside class="layout-object-details-sidenav column is-3 is-narrow-mobile is-hidden-mobile">
          <side-nav :current-iri="iri" />
        </aside>

        <section class="layout-object-details-content column is-9">
          <object-details
            v-if="object"
            :object="object"
            :ontology="ontology"
            :structure="structure" />

          <property-proposals
            id="proposals"
            :iri="iri" />

          <discussions
            id="conversations"
            :iri="iri" />
        </section>
      </div>

    </div>
    <div v-else />
  </div>
</template>

<script>
import rdf from 'rdf-ext'
import { resource } from 'rdf-utils-dataset'
// https://zulip.zazuko.com/#narrow/stream/11-rdfjs/subject/jsonld.20serializer/near/4899
import JsonLdSerializer from 'rdf-serializer-jsonld'
import _get from 'lodash/get'

import Structure from '@/components/fallback/Structure'
import ObjectDetails from '@/components/fallback/ObjectDetails'
import SideNav from '@/components/fallback/sidenav/SideNav'
import Discussions from '@/components/fallback/Discussions'
import PropertyProposals from '@/components/fallback/PropertyProposals'
import ClassProposals from '@/components/fallback/ClassProposals'
import Loader from '@/components/layout/Loader'

import { findSubtreeInForest, term } from '@/libs/utils'

export default {
  layout: 'background',
  async asyncData ({ route, store }) {
    const params = route.params
    let iri = store.state.config.ontology.datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')
    if (route.path.endsWith('/')) {
      iri += '/'
    }

    let iriDataset = rdf.dataset()
    let jsonld = ''

    try {
      jsonld = await new Promise((resolve, reject) => {
        iriDataset = matched(store, iri)
        if (!iriDataset) {
          resolve()
        }
        const quadStream = rdf.graph(iriDataset).toStream()

        const serializer = new JsonLdSerializer({ outputFormat: 'string', compact: true })

        const jsonStream = serializer.import(quadStream)

        jsonStream.on('error', (err) => {
          reject(err)
        })
        jsonStream.on('data', (jsonld) => {
          resolve(JSON.stringify(jsonld))
        })
        jsonStream.on('end', () => {
          resolve()
        })
      })
    }
    catch (err) {
      console.error(err)
    }

    return {
      iri,
      iriDataset,
      jsonld
    }
  },
  components: {
    SideNav,
    Structure,
    ObjectDetails,
    Discussions,
    PropertyProposals,
    ClassProposals,
    Loader
  },
  computed: {
    isObjectList () {
      return this.$termIRI && this.$termIRI.creativeWork.equals(this.objectType)
    },
    isObjectDetails () {
      return !this.isObjectList
    },
    subtree () {
      const structureTree = this.$store.state.graph.structureTree
      const tree = findSubtreeInForest(structureTree, this.iri)
      return tree
    },
    object () {
      if (!(this.$termIRI.ClassLikes.includes(this.objectType.value) || this.$termIRI.PropertyLikes.includes(this.objectType.value))) {
        return null
      }
      return this.ontology.match(rdf.namedNode(this.iri))
    },
    label () {
      let label
      if (this.subtree) {
        return this.subtree.label
      }
      else if (this.object) {
        label = this.object.match(rdf.namedNode(this.iri), this.$termIRI.label).toArray()[0]
      }
      if (label && label.object) {
        return label.object.value
      }
      return ''
    },
    comment () {
      let comment
      if (this.subtree) {
        comment = this.subtree.quads.match(rdf.namedNode(this.iri), this.$termIRI.comment).toArray()[0]
      }
      else if (this.object) {
        comment = this.object.match(rdf.namedNode(this.iri), this.$termIRI.comment).toArray()[0]
      }
      if (comment) {
        return comment.object.value
      }
      return ''
    }
  },
  data () {
    return {
      objectType: '',
      ontology: rdf.dataset(),
      structure: rdf.dataset(),
      dataReady: false
    }
  },
  methods: {
    term,
    setObjectType () {
      if (this.structure) {
        const subject = rdf.namedNode(this.iri)
        const ontologyMatches = this.ontology.match(subject, this.$termIRI.a).toArray()
        if (ontologyMatches.length === 1) {
          this.objectType = ontologyMatches[0].object
        }
        const structureMatches = this.structure.match(subject, this.$termIRI.a).toArray()
        if (structureMatches.length === 1) {
          this.objectType = structureMatches[0].object
        }
      }
      this.dataReady = true
    },
    hasChildContainers (obj) {
      return !!_get(obj, 'children', []).find(x => x.isCreativeWork)
    }
  },
  mounted () {
    this.ontology = this.$store.getters['graph/ontology']
    this.structure = this.$store.getters['graph/structure']
    this.setObjectType()
  },
  validate ({ params, store, route }) {
    // we arrived here by loading the page, it's an entry page
    const ontology = store.state.graph.ontology
    const structure = store.state.graph.structure

    // when trifid cannot find the IRI in the dataset, the request goes through
    // nuxt but without `req.dataset`, which means the store is empty and here
    // is our chance to send a 404
    if (typeof ontology.match !== 'function') {
      return false
    }

    // check that either the ontology or the structure contains this IRI
    let iri = store.state.config.ontology.datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')

    // we don't have access to asyncData in here
    if (route.path.endsWith('/')) {
      iri += '/'
    }

    if (ontology.match(rdf.namedNode(iri)).toArray().length) {
      return true
    }

    if (structure.match(rdf.namedNode(iri)).toArray().length) {
      return true
    }

    // triggers a 404
    return false
  },
  head () {
    const h = {
      title: this.$headTitle(term(this.iri))
    }
    if (this.label) {
      h.title = this.$headTitle(this.label)
    }
    if (this.comment) {
      h.meta = [
        { hid: 'description', name: 'description', content: this.comment }
      ]
    }
    if (this.jsonld) {
      h.script = [
        { innerHTML: this.jsonld, type: 'application/ld+json', id: 'data' }
      ]
      h.__dangerouslyDisableSanitizers = ['script']
    }
    return h
  }
}

function matched (store, iri) {
  const subject = rdf.namedNode(iri)
  const ontologyDataset = store.getters['graph/ontology']
  const structureDataset = store.getters['graph/structure']

  const ontology = resource(ontologyDataset, subject)
  const structure = resource(structureDataset, subject)

  if (ontology.size > 0) {
    return ontology
  }
  return structure
}
</script>
