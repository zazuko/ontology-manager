<template>
  <div
    :id="prop['label']"
    :class="{
      'is-prop-subform': subform,
      'proposal-draft': !disabled
    }">

    <div
      v-if="!prop['collapsed'] || !disabled">
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
            <h2 class="title">New Property <span v-show="prop['label']">"<em>{{ prop['label'] }}</em>"</span></h2>
            <p
              v-show="prop['iri']"
              class="subtitle">
              <code>{{ prop['iri'] }}</code>
            </p>
          </div>
          <!--<div class="column">
            <button class="button is-warning is-pulled-right">Remove</button>
          </div>-->
        </div>

        <div class="columns">
          <div class="column">
            <div class="columns">
              <div class="column is-6 field">
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
                  :disabled="disabled"
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
                  :disabled="disabled"
                  class="textarea"
                  v-debounce
                  v-model.lazy="prop['description']" />
              </div>
            </div>
          </div>

        </div>

        <div class="columns">
          <div class="column">
            <div class="field">
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
          v-show="validBase"
          class="columns">
          <div class="column">
            <div
              v-if="renderTypeahead">
              <typeahead
                :disabled="disabled"
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
                    class "{{ typeahead.inputString }}"?
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
                      v-show="!disabled"
                      class="panel-icon"
                      @click.prevent="index > 0 && unselectDomain(index)">
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
                  v-if="typeahead.inputString && canCreateRange(typeahead.inputString)"
                  slot="custom-options"
                  slot-scope="typeahead"
                  class="dropdown-item">
                  Create <a
                    title="Add as a new class"
                    @click.prevent="createRange(typeahead.inputString) && typeahead.hide()">
                    class "{{ typeahead.inputString }}"?
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
          class="columns">
          <div class="column">
            <button
              class="button is-success"
              :disabled="!validBase"
              @click.prevent="$vuexSet(`${storePath}.collapsed`, true)">
              Add "<em>{{ prop['label'] }}</em>" to the proposal
            </button>
          </div>
        </div>

      </div>

      <div v-if="prop['classChildren'] && prop['classChildren'].length">
        <new-class-form
          v-for="(newClass, index) in prop['classChildren']"
          :key="index"
          :subform="true"
          :iri="iri"
          :disabled="disabled"
          :store-path="`${storePath}.classChildren[${index}]`"
          :base-datasets="mergedDatasets" />
      </div>
      <div v-else />

      <slot />

    </div>
    <div v-else>

      <div class="box">
        <div class="columns">
          <div class="column is-8">
            <h2 class="subtitle">New Property "<em>{{ prop['label'] }}</em>"</h2>
          </div>
          <div class="column">
            <button
              @click.prevent="$vuexSet(`${storePath}.collapsed`, false)"
              class="button is-info is-pulled-right">
              Reopen
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import _get from 'lodash/get'
import rdf from 'rdf-ext'
import { domainsSearchFactory, labelQuadForIRI, term, normalizeLabel, termIRI } from '@/libs/rdf'
import { debounce } from '@/libs/utils'
import Typeahead from './Typeahead'
import { Class } from '@/models/Class'
import { toDataset, toNT, validate } from '@/models/Property'

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
    NewClassForm: () => import('@/components/proposal/NewClassForm'),
    Typeahead
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
      return toDataset(this.prop, false)
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
        ontology: datasets.ontology.clone().merge(this.ontology),
        structure: datasets.structure.clone().merge(this.structure)
      }
    },
    validBase () {
      try {
        // this triggers validation
        validate(this.prop)
        return true
      } catch (err) {
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
      const childIndex = this.prop['classChildren'].indexOf(this.prop[`domains[${index}]`])
      this.$vuexDeleteAtIndex('classChildren', childIndex)
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
      const childIndex = this.prop['classChildren'].indexOf(this.prop[`ranges[${index}]`])
      this.$vuexDeleteAtIndex('classChildren', childIndex)
      this.$vuexDeleteAtIndex('ranges', index)
    },
    canCreateDomain (label) {
      return /^([A-Z])/.test(label)
    },
    createDomain (label) {
      const clss = new Class({ label, isNew: true })
      this.$vuexPush('domains', clss)
      this.$vuexPush('classChildren', clss)
      return true
    },
    canCreateRange (label) {
      return /^([A-Z])/.test(label)
    },
    createRange (label) {
      const clss = new Class({ label, isNew: true })
      this.$vuexPush('ranges', clss)
      this.$vuexPush('classChildren', clss)
      return true
    },
    invalidPropname (label) {
      return !/^([a-z])/.test(label)
    },
    init () {
      if (this.baseDatasets) {
        this.ontology = this.baseDatasets.ontology
        this.structure = this.baseDatasets.structure
      } else {
        this.ontology = this.$store.getters['graph/ontology']
        this.structure = this.$store.getters['graph/structure']
      }
      this.searchFunction = domainsSearchFactory(this.ontology, 'Class', true)
      this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
      if (!this.subform && this.prop['domains.length'] === 0) {
        const currentLabelQuad = labelQuadForIRI(this.ontology, this.iri)
        this.$vuexPush('domains', currentLabelQuad)
      }
      this.onParentIRIChange()
    },
    debugGenerateNT () {
      try {
        const datasets = toDataset(this.prop)
        this.debugNT = toNT(null, datasets.ontology)
        this.debugNT += `\n\n${'-'.repeat(20)}\n\n`
        this.debugNT += toNT(null, datasets.structure)
      } catch (err) {
        this.debugNT = err.message
      }
    }
  }
}
</script>
