<template>
  <div
    :id="prop['label']"
    :class="{
      'is-prop-form': !subform,
      'is-prop-subform': subform,
      'is-subform': subform,
      'proposal-draft': !disabled
    }">

    <template v-if="disabled || !prop['isSubFormCollapsed']">
      <!-- <div
        v-show="!subform && prop['iri']"
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
      </div> -->

      <div class="box">
        <div class="columns">
          <div class="column is-8">
            <h2
              v-if="prop['isEdit']"
              class="title is-2">
              <span v-show="!prop['isEdit']">Changed</span> Property <span v-show="prop['label']">"<em>{{ prop['label'] }}</em>"</span>
            </h2>
            <h2
              v-else
              class="title is-2">
              <span v-show="!prop['isEdit']">New</span> Property <span v-show="prop['label']">"<em>{{ prop['label'] }}</em>"</span>
            </h2>
            <p
              v-show="prop['iri']"
              class="subtitle is-1">
              <span class="title-url">{{ prop['iri'] }}</span>
            </p>
          </div>
          <div class="column">
            <!--<button class="button is-warning is-pulled-right">Remove</button>-->
          </div>
        </div>

        <div class="columns property-details">
          <div class="column is-6">
            <div class="field property-name">
              <label class="label">Property Name</label>
              <div class="control">
                <input
                  :disabled="disabled"
                  :class="{'is-danger': !prop['label']}"
                  class="input"
                  autocomplete="new-password"
                  type="text"
                  v-debounce
                  v-model.lazy="prop['label']">
              </div>
              <p
                v-show="!prop['label']"
                class="help is-danger">
                Please enter the property name.
              </p>
            </div>
            <div class="field short-description">
              <label class="label">Short Description</label>
              <div class="control">
                <textarea
                  class="textarea"
                  :disabled="disabled"
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
            <div class="field deprecated">
              <div class="control">
                <label class="checkbox">
                  <input
                    type="checkbox"
                    v-model.lazy="prop['isDeprecated']">
                  Deprecate Property
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
                  v-model.lazy="prop['description']" />
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
                  v-model.lazy="prop['example']"
                  class="textarea"
                  placeholder="" />
              </div>
            </div>
          </div>
        </div>

        <hr>

        <div
          v-show="canContinue"
          class="columns fold">
          <div class="column">
            <div
              v-if="renderTypeahead">
              <typeahead
                :disabled="disabled"
                :search-function="searchFunction"
                label="Applies to the Following Classes"
                @selectionChanged="selectDomain">
                <div
                  v-if="typeahead.inputString"
                  slot="custom-options"
                  slot-scope="typeahead"
                  class="dropdown-item">
                  Create <a
                    title="Add as a new class"
                    @click.prevent="createDomain(typeahead.inputString) && typeahead.hide()">
                    class "{{ typeahead.inputString }}"?
                  </a>
                </div>
                <nav
                  slot="selected-list"
                  class="panel">
                  <a
                    v-for="(domain, index) in prop['domains']"
                    :key="index"
                    :class="{ 'is-active': (edit || index > 0) }"
                    class="panel-block">
                    <span
                      v-show="!disabled"
                      class="panel-icon"
                      @click.prevent="(edit || index > 0) && unselectDomain(index)">
                      <i class="mdi mdi-close-circle" />
                    </span>
                    {{ (domain.object && term(domain.object)) || domain.label }}
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
                :disabled="disabled"
                :search-function="searchFunction"
                label="Expected Type"
                @selectionChanged="selectRange">
                <div
                  v-if="typeahead.inputString"
                  slot="custom-options"
                  slot-scope="typeahead"
                  class="dropdown-item">
                  <span v-if="typeahead.inputString.startsWith('http')">
                    <a
                      title="Add external class"
                      @click.prevent="addExternalRange(typeahead.inputString) && typeahead.hide()">
                      Add external class "{{ typeahead.inputString }}"?
                    </a>
                  </span>
                  <span v-else>
                    <a
                      title="Add as a new class"
                      @click.prevent="createRange(typeahead.inputString) && typeahead.hide()">
                      Create class "{{ typeahead.inputString }}"?
                    </a>
                  </span>
                </div>
                <nav
                  slot="selected-list"
                  class="panel">
                  <a
                    v-for="(range, index) in prop['ranges']"
                    :key="index"
                    class="panel-block is-active">
                    <span
                      v-show="!disabled"
                      class="panel-icon"
                      @click.prevent="unselectRange(index)">
                      <i class="mdi mdi-close-circle" />
                    </span>
                    <span
                      v-if="!range.label && range.predicate.value === termIRI.a.value">
                      {{ term(range.subject) }}
                    </span>
                    <span v-else>
                      {{ (range.object && term(range.object)) || range.label }}
                    </span>
                  </a>
                </nav>
              </typeahead>
            </div>
            <div v-else />
          </div>
        </div>

        <div
          v-show="subform && !disabled"
          class="columns subform-actions">
          <div class="column is-6">
            <button
              class="button is-info subform-submit"
              :disabled="!canContinue"
              @click.prevent="$vuexSet(`${storePath}.isSubFormCollapsed`, true)">
              Add "<em>{{ prop['label'] }}</em>" to the proposal
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

      <template v-if="prop['classChildren'] && prop['classChildren'].length">
        <class-form
          v-for="(newClass, index) in prop['classChildren']"
          :key="index"
          :subform="true"
          :iri="iri"
          :disabled="disabled"
          :store-path="`${storePath}.classChildren[${index}]`"
          :base-datasets="mergedDatasets" />
      </template>

      <slot />

    </template>
    <template v-else>

      <div class="box">
        <div class="columns">
          <div class="column is-8">
            <h2
              v-if="prop['isEdit']"
              class="subtitle collapsed-title">
              Changed Property "<em>{{ prop['label'] }}</em>"
            </h2>
            <h2
              v-else
              class="subtitle collapsed-title">
              New Property "<em>{{ prop['label'] }}</em>"
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
import { domainsSearchFactory, labelQuadForIRI, term, normalizeLabel, termIRI, externalIRIToQuad } from '@/libs/rdf'
import { debounce } from '@/libs/utils'
import Typeahead from './Typeahead'
import Editor from '@/components/editor/Editor'
import { Class } from '@/models/Class'
import { proposalDataset, generatePropertyProposal, validate } from '@/models/Property'

export default {
  name: 'PropertyForm',
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
      default: 'prop.prop'
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
    ClassForm: () => import('@/components/proposal/ClassForm'),
    Typeahead,
    Editor
  },
  mounted () {
    this.init()
  },
  data () {
    return {
      searchFunction: () => ([]),
      renderTypeahead: process.client,
      ontology: rdf.dataset(),
      structure: rdf.dataset(),
      debugNT: '',
      termIRI
    }
  },
  computed: {
    datasets () {
      return proposalDataset(this.prop, false)
    },
    prop () {
      if (process.server) {
        return _get(this.$store.state, this.storePath, this.$store.state.prop.prop)
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
    canContinue () {
      // while editing a property we want to see the full form even if the
      // property we're editing didn't have a short description (which would
      // otherwise hide the end of the form)
      if (this.edit) {
        return true
      }
      try {
        // this triggers validation
        validate(this.prop)
        return true
      }
      catch (err) {
        return false
      }
    }
  },
  watch: {
    'prop.label' () {
      this.$vuexSet(`${this.storePath}.iri`, this.prop['baseIRI'] + normalizeLabel(this.prop['label'], 'camel'))
    },
    '$parent.clss.label' () {
      this.onParentIRIChange()
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
      this.$vuexPush('domains', labelQuadForIRI(this.ontology, searchResult.iri))
    },
    onParentIRIChange: debounce(function () {
      if (this.subform) {
        const parentLabelQuad = labelQuadForIRI(this.$parent.datasets.ontology, this.$parent.clss.iri)
        this.$vuexSet(`${this.storePath}.domains[0]`, parentLabelQuad)
      }
    }, 400),
    unselectDomain (index) {
      const domain = this.prop[`domains[${index}]`]
      const childIndex = this.prop['classChildren'].indexOf(domain)
      this.$vuexDeleteAtIndex('classChildren', childIndex)
      this.$vuexDeleteAtIndex('domains', index)

      if (this.prop['isEdit']) {
        this.$vuexPush('domainsRemoved', domain.subject.value)
      }
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
      const range = this.prop[`ranges[${index}]`]
      const childIndex = this.prop['classChildren'].indexOf(range)
      this.$vuexDeleteAtIndex('classChildren', childIndex)
      this.$vuexDeleteAtIndex('ranges', index)

      if (this.prop['isEdit']) {
        this.$vuexPush('rangesRemoved', range.subject.value)
      }
    },
    createDomain (label) {
      const clss = new Class({ label, isNew: true })
      // should we push 'this.prop' into 'clss' here?
      // or do something like :parentProp="prop" on <class-form in here and display it there?
      this.$vuexPush('domains', clss)
      this.$vuexPush('classChildren', clss)
      return true
    },
    createRange (label) {
      const clss = new Class({ label, isNew: true })
      this.$vuexPush('ranges', clss)
      this.$vuexPush('classChildren', clss)
      return true
    },
    addExternalRange (iri) {
      this.$vuexPush('ranges', externalIRIToQuad(iri))
      return true
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
      this.searchFunction = domainsSearchFactory(this.ontology, 'Class', true)
      this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
      if (!this.subform) {
        if (this.edit) {
          const originalIRI = this.prop['originalIRI'] || this.prop['iri']
          this.$vuexSet(`${this.storePath}.originalIRI`, originalIRI)
        }
        if (this.prop['domains.length'] === 0) {
          const currentLabelQuad = labelQuadForIRI(this.ontology, this.iri)
          this.$vuexPush('domains', currentLabelQuad)
        }
      }
      this.onParentIRIChange()
    },
    debugGenerateNT () {
      try {
        const datasets = generatePropertyProposal({
          ontology: this.ontology,
          structure: this.structure,
          property: this.prop
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
