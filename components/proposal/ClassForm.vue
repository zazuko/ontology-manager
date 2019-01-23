<template>
  <div
    :id="clss['label']"
    :class="{
      'is-class-form': !subform,
      'is-class-subform': subform,
      'is-subform': subform,
      'proposal-draft': !disabled
    }">

    <template v-if="disabled || !clss['isSubFormCollapsed']">
      <!--
      <div
        v-show="!subform && clss['iri']"
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
      -->

      <div
        :class="{
          'is-marginless': clss['propChildren.length'],
          'has-prop-subform': clss['propChildren.length'],
        }"
        class="box">

        <div class="columns">
          <div class="column is-8">
            <h2
              v-if="clss['isEdit']"
              class="title is-2">
              <span v-show="!edit">Changed</span> Class <span v-show="clss['label']">"<em>{{ clss['label'] }}</em>"</span>
            </h2>
            <h2
              v-else
              class="title is-2">
              <span v-show="!edit">New</span> Class <span v-show="clss['label']">"<em>{{ clss['label'] }}</em>"</span>
            </h2>
            <p
              v-show="clss['iri']"
              class="subtitle is-1">
              <span class="title-url">{{ clss['iri'] }}</span>
            </p>
          </div>
          <!--<div class="column">
            <button class="button is-warning is-pulled-right">Remove</button>
          </div>-->
        </div>

        <div class="columns class-details">
          <div class="column is-6">
            <label class="label">Class Name</label>
            <div class="field class-name">
              <div class="control">
                <input
                  :disabled="disabled"
                  :class="{'is-danger': !clss['label']}"
                  class="input"
                  autocomplete="new-password"
                  type="text"
                  v-debounce
                  v-model.lazy="clss['label']">
              </div>
              <p
                v-show="clss['label'] && invalidClassname(clss['label'])"
                class="help is-danger">
                Class name must start with an <strong>Uppercase</strong> letter!
              </p>
              <p
                v-show="!clss['label']"
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
                  :class="{'is-danger': !clss['comment']}"
                  v-debounce
                  v-model.lazy="clss['comment']" />
              </div>
              <p
                v-show="!clss['comment']"
                class="help is-danger">
                Please write a short description.
              </p>
            </div>
            <div class="field deprecated">
              <div class="control">
                <label class="checkbox">
                  <input
                    type="checkbox"
                    v-model.lazy="clss['isDeprecated']">
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
                  v-model.lazy="clss['description']" />
              </div>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column">
            <div class="field example">
              <label class="label">Example</label>
              <div class="control">
                <textarea
                  :disabled="disabled"
                  v-debounce
                  v-model.lazy="clss['example']"
                  class="textarea"
                  placeholder="" />
              </div>
            </div>
          </div>
        </div>

        <hr>

        <div
          v-show="validBase"
          class="columns fold">
          <div class="column">
            <div
              v-if="renderTypeahead">
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
            </div>
            <div v-else />
          </div>
          <div class="column" />
        </div>

        <proposal-properties-table
          v-if="clss['domains.length']"
          :disabled="disabled"
          :properties="clss['domains']"
          :store-path="storePath"
          :dataset="mergedDatasets.ontology"
          @delete="unselectDomain" />

        <div
          v-show="subform && !disabled"
          class="columns subform-actions">
          <div class="column is-6">
            <button
              class="button is-info subform-submit"
              :disabled="!validBase"
              @click.prevent="$vuexSet(`${storePath}.isSubFormCollapsed`, true)">
              Add "<em>{{ clss['label'] }}</em>" to the proposal
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

      <template v-if="clss['propChildren'] && clss['propChildren'].length">
        <property-form
          v-for="(newProp, index) in clss['propChildren']"
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
              v-if="clss['isEdit']"
              class="subtitle collapsed-title">
              Changed Class "<em>{{ clss['label'] }}</em>"
            </h2>
            <h2
              v-else
              class="subtitle collapsed-title">
              New Class "<em>{{ clss['label'] }}</em>"
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
import { domainsSearchFactory, term, normalizeLabel } from '@/libs/rdf'
import Typeahead from './Typeahead'
import ProposalPropertiesTable from './ProposalPropertiesTable'
import Editor from '@/components/editor/Editor'
import { Property } from '@/models/Property'
import { generateClassProposal, proposalDataset, validate } from '@/models/Class'
import Dataset from 'indexed-dataset/dataset'

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
  },
  data () {
    return {
      searchFunction: () => ([]),
      renderTypeahead: process.client,
      ontology: new Dataset(),
      structure: new Dataset(),
      debugNT: ''
    }
  },
  computed: {
    datasets () {
      return proposalDataset(this.clss, false)
    },
    clss () {
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
        validate(this.clss)
        return true
      }
      catch (err) {
        return false
      }
    }
  },
  watch: {
    'clss.label' () {
      this.$vuexSet(`${this.storePath}.iri`, this.clss['baseIRI'] + normalizeLabel(this.clss['label'], 'pascal'))
    }
  },
  methods: {
    term,
    $vuexPush (path, ...values) {
      const currentValues = this.clss[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.concat(values))
    },
    $vuexDeleteAtIndex (path, index) {
      const currentValues = this.clss[path]
      this.$vuexSet(`${this.storePath}.${path}`, currentValues.filter((nothing, i) => i !== index))
    },
    selectDomain (searchResult) {
      const domain = searchResult.domain
      // don't add if already in there or same as the container
      const isSelected = ({ subject }) => this.term(subject) === this.term(domain.subject)
      if (this.clss['domains'].find(isSelected) || this.iri === this.term(domain.subject)) {
        return
      }

      this.$vuexPush('domains', searchResult)
    },
    unselectDomain (index) {
      const domain = this.clss[`domains[${index}]`]
      const childIndex = this.clss['propChildren'].indexOf(domain)
      this.$vuexDeleteAtIndex('propChildren', childIndex)
      this.$vuexDeleteAtIndex('domains', index)

      if (this.clss['isEdit']) {
        this.$vuexPush('domainsRemoved', domain.iri)
      }
    },
    createProperty (label) {
      const prop = new Property({ label, isNew: true })
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
        const originalIRI = this.clss['originalIRI'] || this.clss['iri']
        this.$vuexSet(`${this.storePath}.originalIRI`, originalIRI)
      }
      this.searchFunction = domainsSearchFactory(this.ontology, 'Property', false)
      this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
    },
    debugGenerateNT () {
      try {
        const datasets = generateClassProposal({
          ontology: this.ontology,
          structure: this.structure,
          clss: this.clss
        })
        this.debugNT = datasets.ontologyContent
        this.debugNT += `\n\n${'-'.repeat(20)}\n\n`
        this.debugNT += datasets.structureContent
      }
      catch (err) {
        this.debugNT = err.message
        console.error(err)
      }
    }
  }
}
</script>
