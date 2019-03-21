<template>
  <div
    :id="proposalObject['label']"
    :class="{
      'is-class-form': !subform,
      'is-class-subform': subform,
      'is-subform': subform,
      'proposal-draft': !disabled
    }">

    <template v-if="disabled || !proposalObject['isSubFormCollapsed']">

      <div
        :class="{
          'is-marginless': proposalObject['propChildren.length'],
          'has-prop-subform': proposalObject['propChildren.length'],
        }"
        class="box">

        <div class="columns">
          <div class="column is-8">
            <h2
              v-if="proposalObject['isEdit']"
              class="title is-2">
              <span v-show="!edit">Changed</span> Class <span v-show="proposalObject['label']">"<em>{{ proposalObject['label'] }}</em>"</span>
            </h2>
            <h2
              v-else
              class="title is-2">
              <span v-show="!edit">New</span> Class <span v-show="proposalObject['label']">"<em>{{ proposalObject['label'] }}</em>"</span>
            </h2>
            <p
              v-show="proposalObject['iri']"
              class="subtitle is-1">
              <span class="title-url">{{ proposalObject['iri'] }}</span>
            </p>
          </div>
          <div class="column">
            <!-- <button class="button is-warning is-pulled-right">Remove</button> -->
          </div>
        </div>

        <div class="columns class-details">
          <div class="column is-6">
            <label class="label">Class Name</label>
            <div class="field class-name">
              <div class="control">
                <input
                  :disabled="disabled"
                  :class="{'is-danger': !proposalObject['label']}"
                  class="input"
                  autocomplete="new-password"
                  type="text"
                  v-debounce
                  v-model.lazy="proposalObject['label']">
              </div>
              <p
                v-show="proposalObject['label'] && invalidClassname(proposalObject['label'])"
                class="help is-danger">
                Class name must start with an <strong>Uppercase</strong> letter!
              </p>
              <p
                v-show="!proposalObject['label']"
                class="help is-danger">
                Please enter the class name.
              </p>
            </div>
            <div class="field short-description">
              <label class="label">Short Description</label>
              <div class="control">
                <textarea
                  class="textarea"
                  :disabled="disabled"
                  :class="{'is-danger': !proposalObject['comment']}"
                  v-debounce
                  v-model.lazy="proposalObject['comment']" />
              </div>
              <p
                v-show="!proposalObject['comment']"
                class="help is-danger">
                Please write a short description.
              </p>
            </div>
            <div class="field deprecated">
              <div class="control">
                <label class="checkbox">
                  <input
                    type="checkbox"
                    :disabled="disabled"
                    v-model.lazy="proposalObject['isDeprecated']">
                  Deprecate Class
                </label>
              </div>
            </div>
          </div>

          <div class="column">
            <div class="field long-description">
              <label class="label">Long Description (optional)</label>
              <div class="control">
                <editor
                  :disabled="disabled"
                  v-debounce
                  v-model.lazy="proposalObject['description']" />
              </div>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <div class="field example">
              <label class="label">Example (valid Turtle)</label>
              <div class="control">
                <textarea
                  ref="exampleTextarea"
                  :disabled="disabled"
                  v-debounce
                  v-model.lazy="proposalObject['example']"
                  class="textarea" />
              </div>
            </div>
          </div>
        </div>

        <hr>

        <div
          v-show="validBase"
          class="columns fold">
          <div class="column">
            <no-ssr>
              <typeahead
                :disabled="disabled"
                :search-function="searchFunction"
                class="properties-typeahead"
                label="Has the Following Properties"
                @selectionChanged="selectDomain">
                <div
                  v-if="typeahead.inputString"
                  slot="custom-options"
                  slot-scope="typeahead"
                  class="dropdown-item create-property">
                  Create <a
                    title="Add as a new property"
                    @click.prevent="createProperty(typeahead.inputString) && typeahead.hide()">
                    property "{{ typeahead.inputString }}"?
                  </a>
                </div>
              </typeahead>
            </no-ssr>
          </div>
          <div class="column" />
        </div>

        <proposal-properties-table
          v-if="proposalObject['domains.length']"
          :iri="proposalObject['iri']"
          :disabled="disabled"
          :properties="proposalObject['domains']"
          :removed-properties="proposalObject['domainsRemoved']"
          :store-path="storePath"
          :dataset="mergedDatasets.ontology"
          @reselectDomain="reselectDomain"
          @delete="unselectDomain" />

        <div
          v-show="subform && !disabled"
          class="columns subform-actions">
          <div class="column is-6">
            <button
              class="button is-info subform-submit"
              :disabled="!validBase"
              @click.prevent="$vuexSet(`${storePath}.isSubFormCollapsed`, true)">
              Add "<em>{{ proposalObject['label'] }}</em>" to the proposal
            </button>
          </div>

          <div class="column is-6">
            <!-- <button
              class="button is-dark-info is-pulled-right subform-cancel">
              Cancel
            </button> -->
          </div>
        </div>

      </div>

      <template v-if="proposalObject['propChildren'] && proposalObject['propChildren'].length">
        <property-form
          v-for="(newProp, index) in proposalObject['propChildren']"
          :key="index"
          :subform="true"
          :iri="iri"
          :disabled="disabled"
          :store-path="`${storePath}.propChildren[${index}]`"
          :base-datasets="mergedDatasets" />
      </template>

      <slot />

    </template>
    <template v-else>

      <div class="box">
        <div class="columns">
          <div class="column is-8">
            <h2
              v-if="proposalObject['isEdit']"
              class="subtitle collapsed-title">
              Changed Class "<em>{{ proposalObject['label'] }}</em>"
            </h2>
            <h2
              v-else
              class="subtitle collapsed-title">
              New Class "<em>{{ proposalObject['label'] }}</em>"
            </h2>
          </div>
          <div class="column">
            <button
              @click.prevent="$vuexSet(`${storePath}.isSubFormCollapsed`, false)"
              class="button is-info is-pulled-right subform-reopen">
              Reopen
            </button>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script>
import _get from 'lodash/get'
import rdf from 'rdf-ext'
import { normalizeLabel, term } from '@/libs/utils'
import Typeahead from './Typeahead'
import Editor from '@/components/editor/Editor'
import ProposalPropertiesTable from './ProposalPropertiesTable'

export default {
  name: 'ClassForm',
  props: {
    iri: {
      type: String,
      required: true
    },
    edit: {
      type: Boolean,
      required: false,
      default: false
    },
    storePath: {
      type: String,
      required: false,
      default: 'class.clss'
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    baseDatasets: {
      type: [Object, Boolean],
      required: false,
      default: false
    },
    subform: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: {
    PropertyForm: () => import('@/components/proposal/PropertyForm'),
    ProposalPropertiesTable,
    Editor,
    Typeahead
  },
  mounted () {
    this.init()
    if (process.browser) {
      let maxRetry = 20
      setTimeout(() => {
        const waitForYate = setInterval(() => {
          if (window.YATE) {
            clearInterval(waitForYate)
            this.yate = window.YATE.fromTextArea(this.$refs.exampleTextarea, {
              readOnly: this.disabled,
              value: this.proposalObject['example']
            })
            this.yate.on('change', cm => {
              this.proposalObject['example'] = cm.getValue()
            })
          }
          else if (--maxRetry <= 0) {
            clearInterval(waitForYate)
          }
        }, 500)
      }, 800)
    }
  },
  data () {
    return {
      searchFunction: () => ([]),
      ontology: rdf.dataset(),
      structure: rdf.dataset(),
      yate: { setValue () {}, getValue () {} }
    }
  },
  computed: {
    datasets () {
      return this.proposalObject.proposalDataset(false)
    },
    proposalObject () {
      if (process.server) {
        return _get(this.$store.state, this.storePath, this.$store.state.class.clss)
      }
      return this.$deepModel(this.storePath)
    },
    mergedDatasets () {
      const datasets = this.datasets
      return {
        ontology: datasets.ontology.merge(this.ontology),
        structure: datasets.structure.merge(this.structure)
      }
    },
    validBase () {
      try {
        // this triggers validation
        this.proposalObject.validate()
        return true
      }
      catch (err) {
        return false
      }
    }
  },
  watch: {
    'proposalObject.label' () {
      this.$vuexSet(`${this.storePath}.iri`, this.proposalObject['baseIRI'] + normalizeLabel(this.proposalObject['label'], 'pascal'))
    }
  },
  methods: {
    $vuexPush (path, ...values) {
      const currentValues = this.proposalObject[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.concat(values))
    },
    $vuexDeleteAtIndex (path, index) {
      const currentValues = this.proposalObject[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.filter((nothing, i) => i !== index))
    },
    selectDomain (searchResult) {
      const domain = searchResult.domain
      // don't add if already in there or same as the container
      const isSelected = ({ subject }) => term(subject) === term(domain.subject)
      if (this.proposalObject['domains'].find(isSelected) || this.iri === term(domain.subject)) {
        return
      }

      this.$vuexPush('domains', searchResult)
    },
    unselectDomain (index) {
      const domain = this.proposalObject.domains[index]
      const childIndex = this.proposalObject['propChildren'].indexOf(domain)
      this.$vuexDeleteAtIndex('propChildren', childIndex)
      this.$vuexDeleteAtIndex('domains', index)

      if (this.proposalObject['isEdit']) {
        this.$vuexPush('domainsRemoved', domain)
      }
    },
    reselectDomain (index) {
      const domain = this.proposalObject.domainsRemoved[index]
      this.$vuexPush('domains', domain)
      this.$vuexDeleteAtIndex('domainsRemoved', index)
    },
    createProperty (label) {
      const prop = new this.$Property({ label, isNew: true })
      this.$vuexPush('domains', prop)
      this.$vuexPush('propChildren', prop)
      return true
    },
    invalidClassname (label) {
      return !/^([A-Z])/.test(label)
    },
    init () {
      if (this.baseDatasets) {
        this.ontology = this.baseDatasets.ontology
        this.structure = this.baseDatasets.structure
      }
      else {
        this.ontology = this.$store.getters['graph/ontology']
        this.structure = this.$store.getters['graph/structure']
      }
      if (!this.subform && this.edit) {
        const originalIRI = this.proposalObject['originalIRI'] || this.proposalObject['iri']
        this.$vuexSet(`${this.storePath}.originalIRI`, originalIRI)
      }
      this.searchFunction = this.$domainsSearchFactory(this.ontology, 'Property', false)
      this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
    }
  }
}
</script>
