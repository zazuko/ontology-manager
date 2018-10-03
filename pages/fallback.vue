<template>
  <div class="container">
    <section class="main-content columns is-fullheight">
      <script
        v-if="jsonld"
        id="data"
        type="application/ld+json"
        v-html="jsonld" />

      <side-nav :current-iri="iri" />

      <div class="container column is-10">
        <div class="section">

          <div class="card">
            <div class="card-header"><p class="card-header-title">Header</p></div>
            <div class="card-content"><div class="content">Content</div></div>
          </div>

          <h1 class="title">{{ iri }} {{ isClass() }}</h1>

          <structure
            v-if="subtree"
            :obj="subtree"
            :name="subtree.label" />

          <div
            v-if="proposals && proposals.proposals">
            <div
              v-for="proposal in proposals.proposals"
              :key="proposal.id">
              <h1 class="title">{{ proposal }}</h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import rdf from 'rdf-ext'
import Structure from '~/components/Structure'
import SideNav from '~/components/SideNav'
import { datasetsSetup, findSubtreeInForest } from '~/libs/utils'

const datasetBaseUrl = require('~/trifid/trifid.config.json').datasetBaseUrl

export default {
  asyncData ({ route }) {
    const isStructure = route.path.endsWith('/')
    return {
      isStructure
    }
  },
  components: {
    SideNav,
    Structure
  },
  computed: {
    subtree () {
      const structureTree = this.$store.state.graph.structureTree
      const tree = findSubtreeInForest(structureTree, this.iri)
      return tree
    },
    iri () {
      const params = this.$route.params
      let iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')
      if (this.isStructure) iri += '/'
      return iri
    },
    jsonld () {
      // TODO: serialize and put in source here
      return ''
    }
  },
  async created () {
    await datasetsSetup(this.$store)
  },
  data () {
    return {
      ontology: undefined
    }
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        this.ontology = window.ontology
        clearInterval(i)
      }
    })
  },
  methods: {
    isClass () {
      if (!this.isStructure) {
        if (this.ontology) {
          const subject = rdf.namedNode(this.iri)
          const predicate = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
          const object = rdf.namedNode('http://www.w3.org/2002/07/owl#Class')
          return this.ontology.match(subject, predicate, object).toArray()
        }
      }
    }
  },
  validate ({ params, store, route }) {
    let ontology
    let structure
    if (typeof window !== 'undefined' && window.ontology) {
      // we arrived here by navigating from another page
      ontology = window.ontology
      structure = window.structure
    } else {
      // we arrived here by loading the page, it's an entry page
      ontology = store.state.graph.ontology
      structure = store.state.graph.structure
    }

    // when trifid cannot find the IRI in the dataset, the request goes through
    // nuxt but without `req.dataset`, which means the store is empty and here
    // is our chance to send a 404
    if (typeof ontology.match !== 'function') {
      return false
    }

    // check that either the ontology or the structure contains this IRI
    let iri = datasetBaseUrl + [params.p1, params.p2, params.p3, params.p4].filter(Boolean).join('/')

    // we don't have access to `this.isStructure()` in here
    // THIS SHOULD BE IN STORE!
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
  apollo: {
    proposals: {
      query: gql` query GetProposals ($iri: String!) {
        proposals: proposalsByIri (iri: $iri) {
          proposals: nodes {
            id,
            headline,
            body,
            hat: hatByHatId {
              title
            },
            author: personByAuthorId {
              avatar,
              name
            },
            iri,
            threadType,
            authorId,
            externalId,
            answers: messagesByThreadId {
              messages: nodes {
                id,
                body,
                author: personByAuthorId {
                  name
                }
              }
            }
          }
        }
      }`,
      variables () {
        return {
          iri: this.iri
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
