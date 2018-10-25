<template>
  <div
    :class="{ subform }">

    <div
      v-show="prop['iri']"
      class="box debug">
      <div class="columns">
        <div class="column">
          <button
            class="button is-big is-warning"
            @click.prevent="debugGenerateNT">
            debug button: refresh NT
          </button>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <pre
            class="is-clearfix"
            v-show="debugNT">{{ debugNT }}</pre>
        </div>
      </div>
      <div
        v-show="debugNT"
        class="columns">
        <div class="column">
          <button
            class="button is-big is-warning"
            @click.prevent="debugGenerateNT">
            debug button: refresh NT
          </button>
        </div>
      </div>
    </div>

    <div class="box">

      <div class="columns">
        <div class="column">
          <h2 class="title">New Property "<em>{{ prop['label'] }}</em>"</h2>
          <p
            v-show="prop['iri']"
            class="subtitle">
            <code>{{ prop['iri'] }}</code>
          </p>

          <div class="columns">
            <div class="column is-6 field">
              <label class="label">Property Name</label>
              <div class="control">
                <input
                  :class="{'is-danger': !prop['label']}"
                  class="input"
                  autocomplete="new-password"
                  type="text"
                  v-debounce
                  v-model.lazy="prop['label']">
              </div>
              <p
                v-if="prop['label'] && invalidPropname(prop['label'])"
                class="help is-danger">
                Property name must start with a <strong>lowercase</strong> letter!
              </p>
              <p
                v-else-if="!prop['label']"
                class="help is-danger">
                Please enter the property name.
              </p>
              <p v-else />
            </div>
          </div>
        </div>
      </div>

      <div class="columns">

        <div class="column">
          <div class="field">
            <label class="label">Short Description</label>
            <div class="control">
              <textarea
                class="textarea"
                :class="{'is-danger': !prop['comment']}"
                v-debounce
                v-model.lazy="prop['comment']" />
            </div>
            <p
              v-show="!prop['comment']"
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
                v-debounce
                v-model.lazy="prop['description']" />
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
                  @click.prevent="createDomain(typeahead.inputString) && typeahead.hide()">
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
                  @click.prevent="createRange(typeahead.inputString) && typeahead.hide()">
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
                  {{ (range.subject && term(range.subject)) || range.label }}
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
      :parent-dataset="dataset"
      :store-path="`${storePath}.classChildren[${index}]`"
      :ontology-base="mergedOntology" />

    <div class="box">
      <div class="field">
        <label class="label">Example</label>
        <div class="control">
          <textarea
            v-debounce
            v-model.lazy="prop['example']"
            class="textarea"
            placeholder="" />
        </div>
      </div>
    </div>

    <slot />

  </div>
</template>

<script>
import { domainsSearchFactory, labelQuadForIRI, term, normalizeLabel } from '@/libs/rdf'
import { datasetsSetup } from '@/libs/utils'
import Typeahead from '@/components/Typeahead'
import NewClassForm from '@/components/NewClassForm'
import { Class } from '@/models/Class'
import { toDataset, toNT } from '@/models/Property'

export default {
  name: 'NewPropertyForm',
  props: {
    iri: {
      type: String,
      required: true
    },
    parentDataset: {
      type: Object,
      required: false,
      default: () => ({})
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
        if (!this.subform && this.prop['domains.length'] === 0) {
          const currentLabelQuad = labelQuadForIRI(this.ontology, this.iri)
          this.$vuexPush('domains', currentLabelQuad)
        }
      }
    })
  },
  data () {
    return {
      searchFunction: () => ([]),
      renderTypeahead: process.client,
      debugNT: ''
    }
  },
  computed: {
    dataset () {
      return toDataset(this.prop, false)
    },
    prop () {
      if (this.subform) {
        this.$vuexSet(`${this.storePath}.domains[0]`, labelQuadForIRI(this.parentDataset))
      }
      return this.$deepModel(this.storePath)
    },
    mergedOntology () {
      return this.dataset.clone().merge(this.ontology)
    }
  },
  watch: {
    'prop.label' () {
      this.$vuexSet(`${this.storePath}.iri`, this.prop['baseIRI'] + normalizeLabel(this.prop['label'], 'camel'))
    }
  },
  methods: {
    term,
    $vuexPush (path, ...values) {
      const currentValues = this.prop[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.concat(values))
    },
    $vuexDeleteAtIndex (path, index) {
      const currentValues = this.prop[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.filter((nothing, i) => i !== index))
    },
    selectDomain (searchResult) {
      const domain = searchResult.domain
      // don't add if already in there or same as the container
      const isSelected = ({ subject }) => this.term(subject) === this.term(domain.subject)
      if (this.prop['domains'].find(isSelected) || this.iri === this.term(domain.subject)) {
        return
      }
      this.$vuexPush('domains', labelQuadForIRI(this.ontology, searchResult.key))
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
    canCreateDomain (label) {
      if (this.prop['domains'].includes(label)) {
        return false
      }
      if (this.iri === label) {
        return false
      }
      return /^([A-Z])/.test(label)
    },
    canCreateRange (label) {
      return /^([A-Z])/.test(label)
    },
    createRange (label) {
      const clss = new Class(label)
      this.$vuexPush('ranges', clss)
      this.$vuexPush('classChildren', clss)
      return true
    },
    invalidPropname (label) {
      return !/^([a-z])/.test(label)
    },
    debugGenerateNT () {
      this.debugNT = toNT(null, toDataset(this.prop, false))
    }
  }
}
</script>
