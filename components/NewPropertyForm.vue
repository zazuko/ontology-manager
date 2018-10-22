<template>
  <div>
    <div class="box">

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Property Name</label>
            <div class="control">
              <input
                :class="{'is-danger': !name}"
                class="input"
                autocomplete="new-password"
                type="text"
                v-model="name">
            </div>
          </div>
        </div>
        <div class="column" />
      </div>

      <div class="columns">

        <div class="column">
          <div class="field">
            <label class="label">Short Description</label>
            <div class="control">
              <textarea
                class="textarea"
                :class="{'is-danger': !label}"
                v-model="label" />
            </div>
          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">Long Description (optional)</label>
            <div class="control">
              <textarea
                class="textarea"
                v-model="comment" />
            </div>
          </div>
        </div>
      </div>

      <hr>

      <div class="columns">
        <div class="column">
          <div
            v-if="renderTypeahead">
            <typeahead
              :search-function="searchFunction"
              label="Applies to the Following Classes"
              @selectionChanged="selectDomain">
              <div
                v-if="typeahead.inputString && canCreateDomain(typeahead.inputString)"
                slot="custom-options"
                slot-scope="typeahead"
                class="dropdown-item">
                Create <a
                  title="Add as a new class"
                  @click.prevent="createDomain(typeahead.inputString)">
                  class "{{ typeahead.inputString }}" ?
                </a>
              </div>
              <nav
                slot="selected-list"
                class="panel">
                <a
                  v-for="(domain, index) in domains"
                  :key="index"
                  class:="{ 'is-active': index > 0 }"
                  class="panel-block">
                  <span
                    class="panel-icon"
                    @click.prevent="index > 0 && unselectDomain(index)">
                    <i class="mdi mdi-close-circle" />
                  </span>
                  {{ term(domain.object) }}
                </a>
              </nav>
            </typeahead>
          </div>
          <div v-else />
        </div>
        <div class="column">
          <div
            v-if="renderTypeahead">
            <typeahead
              :search-function="searchFunction"
              label="Expected Type"
              @selectionChanged="selectRange">
              <div
                v-if="typeahead.inputString && canCreateRange(typeahead.inputString)"
                slot="custom-options"
                slot-scope="typeahead"
                class="dropdown-item">
                Create <a
                  title="Add as a new class"
                  @click.prevent="createRange(typeahead.inputString)">
                  class "{{ typeahead.inputString }}" ?
                </a>
              </div>
              <nav
                slot="selected-list"
                class="panel">
                <a
                  v-for="(range, index) in ranges"
                  :key="index"
                  class="panel-block is-active">
                  <span
                    class="panel-icon"
                    @click.prevent="unselectRange(index)">
                    <i class="mdi mdi-close-circle" />
                  </span>
                  {{ term(range.object) }}
                </a>
              </nav>
            </typeahead>
          </div>
          <div v-else />
        </div>
      </div>

    </div>

    <new-class-form
      v-for="(newClass, index) in newClasses"
      :key="index"
      :iri="iri"
      :cls="newClass.cls"
      :ontology="mergedOntology"
      :domain-prefill="newClass.domainPrefill" />

    <div class="box">
      <div class="field">
        <label class="label">Example</label>
        <div class="control">
          <textarea
            class="textarea"
            placeholder="this won't get saved for now" />
        </div>
      </div>
    </div>

    <slot />

  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'
import { createHelpers } from 'vuex-map-fields'
import rdf from 'rdf-ext'

import { domainsSearchFactory, labelQuadForIRI, term } from '@/libs/rdf'
import { datasetsSetup } from '@/libs/utils'
import { Class } from '@/models/Class'
import Typeahead from '@/components/Typeahead'
import NewClassForm from '@/components/NewClassForm'
import { ADD_DOMAIN, DELETE_DOMAIN, ADD_RANGE, DELETE_RANGE } from '@/store/mutation-types'
import {
  mapDomainsMultiRowFields,
  mapRangesMultiRowFields
} from '@/store/property'

const { mapFields: mapPropertyFields } = createHelpers({
  getterType: 'property/getField',
  mutationType: 'property/updateField'
})

const {
  mapMutations: mapDomainMutations
} = createNamespacedHelpers('domains')

const {
  mapMutations: mapRangeMutations
} = createNamespacedHelpers('ranges')

export default {
  name: 'NewPropertyForm',
  props: {
    iri: {
      type: String,
      required: true
    },
    ontology: {
      type: [Object, Boolean],
      required: false,
      default: () => false
    }
  },
  components: {
    NewClassForm,
    Typeahead
  },
  async created () {
    await datasetsSetup(this.$store)
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        clearInterval(i)

        this._ontology = this.ontology || window.ontology
        this.searchFunction = domainsSearchFactory(this._ontology, 'Class', true)
        if (this.domains.length === 0) {
          const currentLabelQuad = labelQuadForIRI(this.iri, this._ontology)
          this.addDomain(currentLabelQuad)
        }
      }
    })
  },
  data () {
    return {
      searchFunction: () => ([]),
      renderTypeahead: process.client,
      newClasses: []
    }
  },
  computed: {
    ...mapPropertyFields(['property.name', 'property.comment', 'property.label']),
    ...mapDomainsMultiRowFields({ domains: 'domains' }),
    ...mapRangesMultiRowFields({ ranges: 'ranges' }),
    mergedOntology () {
      return this.dataset.clone().merge(this._ontology)
    }
  },
  methods: {
    term,
    ...mapDomainMutations({
      addDomain: ADD_DOMAIN,
      deleteDomain: DELETE_DOMAIN
    }),
    ...mapRangeMutations({
      addRange: ADD_RANGE,
      deleteRange: DELETE_RANGE
    }),
    selectDomain (searchResult) {
      const domain = searchResult.domain
      // don't add if already in there or same as the container
      const isSelected = ({ subject }) => this.term(subject) === this.term(domain.subject)
      if (this.domains.find(isSelected) || this.iri === this.term(domain.subject)) {
        return
      }
      this.addDomain(labelQuadForIRI(searchResult.key, this._ontology))
    },
    unselectDomain (index) {
      this.deleteDomain(index)
    },
    selectRange (searchResult) {
      const range = searchResult.domain
      // don't add if already in there
      const isSelected = ({ subject }) => this.term(subject) === this.term(range.subject)
      if (this.ranges.find(isSelected)) {
        return
      }
      this.addRange(range)
    },
    unselectRange (index) {
      this.deleteRange(index)
    },
    canCreateDomain (name) {
      if (this.domains.includes(name)) {
        return false
      }
      if (this.iri === name) {
        return false
      }
      return /^([A-Z])/.test(name)
    },
    canCreateRange (name) {
      return /^([A-Z])/.test(name)
    },
    createRange (name) {
      const newClass = new Class()
      newClass.name = name
      const domainSearch = domainsSearchFactory(this.mergedOntology, 'Property', false)
      newClass.domains.push(rdf.namedNode(this.name))
      this.newClasses.push({
        cls: newClass,
        domainPrefill: domainSearch(this.name)
      })
    }
  }
}
</script>
