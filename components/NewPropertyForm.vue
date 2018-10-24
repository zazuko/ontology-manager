<template>
  <div
    :class="{ subform }">
    <div class="box">

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Property Name</label>
            <div class="control">
              <input
                :class="{'is-danger': !prop['name']}"
                class="input"
                autocomplete="new-password"
                type="text"
                v-model="prop['name']">
            </div>
            <p
              v-if="prop['name'] && invalidPropname(prop['name'])"
              class="help is-danger">
              Property name must start with a <strong>lowercase</strong> letter!
            </p>
            <p
              v-else-if="!prop['name']"
              class="help is-danger">
              Please enter the property name.
            </p>
            <p v-else />
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
                :class="{'is-danger': !prop['label']}"
                v-model="prop['label']" />
            </div>
            <p
              v-show="!prop['label']"
              class="help is-danger">
              Please write a short description.
            </p>
          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">Long Description (optional)</label>
            <div class="control">
              <textarea
                class="textarea"
                v-model="prop['comment']" />
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
                  v-for="(domain, index) in prop['domains']"
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
                  v-for="(range, index) in prop['ranges']"
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
      v-for="(newClass, index) in prop['classChildren']"
      :key="index"
      :subform="true"
      :iri="iri"
      :store-path="`${storePath}.classChildren[${index}]`"
      :ontology-base="mergedOntology" />

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
import { domainsSearchFactory, labelQuadForIRI, term } from '@/libs/rdf'
import { datasetsSetup } from '@/libs/utils'
import Typeahead from '@/components/Typeahead'
import NewClassForm from '@/components/NewClassForm'
import { Class } from '@/models/Class'

const {
  mapGetters: propertyGetters
} = createNamespacedHelpers('prop')

export default {
  name: 'NewPropertyForm',
  props: {
    iri: {
      type: String,
      required: true
    },
    storePath: {
      type: String,
      required: false,
      default: () => 'prop.prop'
    },
    ontologyBase: {
      type: [Object, Boolean],
      required: false,
      default: () => false
    },
    subform: {
      type: Boolean,
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

        this.ontology = this.ontologyBase || window.ontology
        this.searchFunction = domainsSearchFactory(this.ontology, 'Class', true)
        this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
        if (this.prop['domains.length'] === 0) {
          const currentLabelQuad = labelQuadForIRI(this.iri, this.ontology)
          this.$vuexPush('domains', currentLabelQuad)
        }
      }
    })
  },
  data () {
    return {
      searchFunction: () => ([]),
      renderTypeahead: process.client
    }
  },
  computed: {
    prop () {
      return this.$deepModel(this.storePath)
    },
    mergedOntology () {
      return this.dataset().clone().merge(this.ontology)
    }
  },
  methods: {
    $vuexPush (path, ...values) {
      const currentValues = this.prop[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.concat(values))
    },
    $vuexDeleteAtIndex (path, index) {
      const currentValues = this.prop[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.filter((nothing, i) => i !== index))
    },
    ...propertyGetters(['dataset']),
    term,
    selectDomain (searchResult) {
      const domain = searchResult.domain
      // don't add if already in there or same as the container
      const isSelected = ({ subject }) => this.term(subject) === this.term(domain.subject)
      if (this.prop['domains'].find(isSelected) || this.iri === this.term(domain.subject)) {
        return
      }
      this.$vuexPush('domains', labelQuadForIRI(searchResult.key, this.ontology))
    },
    unselectDomain (index) {
      this.$vuexDeleteAtIndex('domains', index)
    },
    selectRange (searchResult) {
      const range = searchResult.domain
      // don't add if already in there
      const isSelected = ({ subject }) => this.term(subject) === this.term(range.subject)
      if (this.prop['ranges'].find(isSelected)) {
        return
      }
      this.$vuexPush('ranges', range)
    },
    unselectRange (index) {
      this.$vuexDeleteAtIndex('ranges', index)
    },
    canCreateDomain (name) {
      if (this.prop['domains'].includes(name)) {
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
      const clss = new Class()
      clss.name = name
      this.$vuexPush('classChildren', clss)
    },
    invalidPropname (name) {
      return !/^([a-z])/.test(name)
    }
  }
}
</script>
