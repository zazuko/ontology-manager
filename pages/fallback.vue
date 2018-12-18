<template>
  <!--
  class="main-content columns is-fullheight"
  -->
  <div>
    <div
      v-if="iri"
      :class="{
        'layout-objects-list': termIRI.creativeWork.equals(objectType),
        'layout-object-details': !termIRI.creativeWork.equals(objectType)
      }"
      class="container">
      <script
        v-if="jsonld"
        id="data"
        type="application/ld+json"
        v-html="jsonld" />

      <div
        v-show="!dataReady"
        class="modal is-active">
        <div class="modal-background" />
        <div class="modal-content has-text-centered">
          <div class="box">
            <div class="lds-roller"><div /><div /><div /><div /><div /><div /><div /><div /></div>
            <p class="subtitle">Loading Data</p>
          </div>
        </div>
      </div>

      <!-- layout-objects-list -->
      <div
        v-if="termIRI.creativeWork.equals(objectType)"
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
            :name="subtree.label"
            :ontology="ontology"
            :structure="structure"
            :is-class="termIRI.Class.equals(objectType)" />
        </section>

        <section
          class="container layout-objects-list-item">
          <class-proposals
            id="proposals"
            :iri="iri" />
        </section>
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
            :structure="structure"
            :is-class="termIRI.Class.equals(objectType)" />

          <property-proposals
            v-if="termIRI.Class.equals(objectType)"
            id="proposals"
            :iri="iri" />
          <div v-else />

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
import _get from 'lodash/get'
// https://zulip.zazuko.com/#narrow/stream/11-rdfjs/subject/jsonld.20serializer/near/4899
import JsonLdSerializer from 'rdf-serializer-jsonld'

import Structure from '@/components/fallback/Structure'
import ObjectDetails from '@/components/fallback/ObjectDetails'
import SideNav from '@/components/fallback/sidenav/SideNav'
import Discussions from '@/components/fallback/Discussions'
import PropertyProposals from '@/components/fallback/PropertyProposals'
import ClassProposals from '@/components/fallback/ClassProposals'
import { findSubtreeInForest, headTitle } from '@/libs/utils'
import { termIRI, term } from '@/libs/rdf'

const datasetBaseUrl = require('@/trifid/trifid.config.json').datasetBaseUrl

export default {
  async asyncData ({ route, store }) {
    const params = route.params
    let iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')
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
          resolve(jsonld)
        })
        jsonStream.on('end', () => {
          resolve()
        })
      })
    }
    catch (err) {
      console.error(err)
      this.$sentry.captureException(err)
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
    ClassProposals
  },
  computed: {
    subtree () {
      const structureTree = this.$store.state.graph.structureTree
      const tree = findSubtreeInForest(structureTree, this.iri)
      return tree
    },
    object () {
      if (!(termIRI.Class.equals(this.objectType) || termIRI.Property.equals(this.objectType))) {
        return null
      }
      if (_get(this.subtree, 'children.length', 0) === 0) {
        return this.ontology.match(rdf.namedNode(this.iri))
      }
      return null
    },
    label () {
      let label
      if (this.subtree) {
        return this.subtree.label
      }
      else if (this.object) {
        label = this.object.match(rdf.namedNode(this.iri), termIRI.label).toArray()[0]
      }
      if (label) {
        return label.object.value
      }
      return ''
    },
    comment () {
      let comment
      if (this.subtree) {
        comment = this.subtree.quads.match(rdf.namedNode(this.iri), termIRI.comment).toArray()[0]
      }
      else if (this.object) {
        comment = this.object.match(rdf.namedNode(this.iri), termIRI.comment).toArray()[0]
      }
      if (comment) {
        return comment.object.value
      }
      return ''
    }
  },
  data () {
    return {
      iri: 'loading',
      termIRI,
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
        const ontologyMatches = this.ontology.match(subject, termIRI.a).toArray()
        if (ontologyMatches.length === 1) {
          this.objectType = ontologyMatches[0].object
        }
        const structureMatches = this.structure.match(subject, termIRI.a).toArray()
        if (structureMatches.length === 1) {
          this.objectType = structureMatches[0].object
        }
      }
      this.dataReady = true
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
    let iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')

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
      title: headTitle(term(this.iri))
    }
    if (this.label) {
      h.title = headTitle(this.label)
    }
    if (this.comment) {
      h.meta = [
        { hid: 'description', name: 'description', content: this.comment }
      ]
    }
    return h
  }
}

function matched (store, iri) {
  const subject = rdf.namedNode(iri)

  const ontologyGraph = store.getters['graph/ontologyGraph']
  const structureGraph = store.getters['graph/structureGraph']

  const foundInOntology = ontologyGraph.match(null, null, null, subject)
  if (foundInOntology.toArray().length) {
    return foundInOntology
  }
  const foundInStructure = structureGraph.match(null, null, null, subject)
  return foundInStructure
}
</script>
