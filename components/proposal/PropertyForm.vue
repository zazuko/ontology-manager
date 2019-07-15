<template>
  <div
    :id="proposalObject['label']"
    :class="{
      'is-prop-form': !subform,
      'is-prop-subform': subform,
      'is-subform': subform,
      'proposal-draft': !readonly
    }">

    <template v-if="readonly || !proposalObject['isSubFormCollapsed']">

      <div class="box">
        <div class="columns">
          <div class="column is-8">
            <h2
              v-if="proposalObject['isEdit']"
              class="title is-2">
              <span v-show="!proposalObject['isEdit']">Changed</span> Property <span v-show="proposalObject['label']">"<em>{{ proposalObject['label'] }}</em>"</span>
            </h2>
            <h2
              v-else
              class="title is-2">
              <span v-show="!proposalObject['isEdit']">New</span> Property <span v-show="proposalObject['label']">"<em>{{ proposalObject['label'] }}</em>"</span>
            </h2>
            <p
              v-show="proposalObject['iri']"
              class="subtitle is-1">
              <span class="title-url">{{ proposalObject['iri'] }}</span>
              <span
                v-for="(sameAs, index) in proposalObject['sameAs']"
                :key="index">
                <br>
                sameAs:
                <span class="title-url">
                  {{ displayNewSameAs(sameAs) }}
                </span>
              </span>
            </p>
          </div>
          <div class="column">
            <!-- <button class="button is-warning is-pulled-right">Remove</button> -->
          </div>
        </div>

        <div class="columns property-details">
          <div class="column is-6">
            <div class="field property-name">
              <label class="label">Property Name</label>
              <div class="control">
                <input
                  :readonly="readonly"
                  :class="{'is-danger': !proposalObject['label']}"
                  class="input"
                  autocomplete="new-password"
                  type="text"
                  v-debounce
                  v-model.lazy="proposalObject['label']">
              </div>
              <p
                v-show="!proposalObject['label']"
                class="help is-danger">
                Please enter the property name.
              </p>
            </div>
            <div class="field short-description">
              <label class="label">Short Description</label>
              <div class="control">
                <textarea
                  class="textarea"
                  :readonly="readonly"
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
                    :readonly="readonly"
                    v-model.lazy="proposalObject['isDeprecated']">
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
                  :readonly="readonly"
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
                  class="textarea"
                  :readonly="readonly"
                  v-debounce
                  v-model.lazy="proposalObject['example']" />
              </div>
            </div>
          </div>
        </div>

        <hr>

        <div
          v-show="canContinue"
          class="fold">
          <div class="columns">
            <div class="column is-6">
              <typeahead
                :readonly="readonly"
                :search-function="propertiesSearch"
                label="Same As (owl:equivalentProperty)"
                @selectionChanged="selectSameAs">
                <div
                  v-if="typeahead.inputString"
                  slot="custom-options"
                  slot-scope="typeahead"
                  class="dropdown-item">
                  <span v-if="typeahead.inputString.startsWith('http')">
                    <a
                      title="Add external owl:sameAs IRI"
                      @click.prevent="addExternalSameAs(typeahead.inputString) && typeahead.hide()">
                      External sameAs: "{{ typeahead.inputString }}"
                    </a>
                  </span>
                </div>
                <nav
                  slot="selected-list"
                  class="panel">
                  <a
                    v-for="(sameAs, index) in proposalObject['sameAs']"
                    :key="index"
                    class="panel-block is-active">
                    <p
                      v-show="proposalObject['isEdit'] && proposalObject['sameAsRemoved'].length"
                      class="is-size-7">
                      Added:
                    </p>
                    <span
                      v-show="!readonly"
                      class="panel-icon"
                      @click.prevent="unselectSameAs(index)">
                      <i class="mdi mdi-close-circle" />
                    </span>
                    {{ displayNewSameAs(sameAs) }}
                  </a>
                  <template v-if="proposalObject['isEdit'] && readonly">
                    <p
                      v-show="proposalObject['sameAsRemoved'].length"
                      class="is-size-7">
                      Removed:
                    </p>
                    <a
                      v-for="(sameAsIRI, index) in proposalObject['sameAsRemoved']"
                      :key="index"
                      class="panel-block is-active">
                      <span v-if="_get($labelQuadForIRI(ontology, sameAsIRI), 'object.value')">
                        {{ _get($labelQuadForIRI(ontology, sameAsIRI), 'object.value') }}
                      </span>
                      <span v-else-if="$unPrefix(sameAsIRI)">
                        {{ $unPrefix(sameAsIRI) }}
                      </span>
                      <span v-else>
                        {{ sameAsIRI }}
                      </span>
                    </a>
                  </template>
                </nav>
              </typeahead>
            </div>
          </div>

          <no-ssr>
            <div class="columns">
              <div class="column">
                <typeahead
                  :readonly="readonly"
                  :search-function="classesSearch"
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
                    <p
                      v-show="proposalObject['isEdit'] && proposalObject['domainsRemoved'].length"
                      class="is-size-7">
                      Added:
                    </p>
                    <a
                      v-for="(domain, index) in proposalObject['domains']"
                      :key="index"
                      :class="{ 'is-active': (readonly || edit || index > 0) }"
                      class="panel-block">
                      <span
                        v-show="!readonly"
                        class="panel-icon"
                        @click.prevent="(readonly || edit || index > 0) && unselectDomain(index)">
                        <i class="mdi mdi-close-circle" />
                      </span>
                      {{ (domain.object && term(domain.object)) || domain.label }}
                    </a>
                    <template v-if="proposalObject['isEdit'] && readonly">
                      <p
                        v-show="proposalObject['domainsRemoved'].length"
                        class="is-size-7">
                        Removed:
                      </p>
                      <a
                        v-for="(domainIRI, index) in proposalObject['domainsRemoved']"
                        :key="index"
                        class="panel-block is-active">
                        <span v-if="_get($labelQuadForIRI(ontology, domainIRI), 'object.value')">
                          {{ _get($labelQuadForIRI(ontology, domainIRI), 'object.value') }}
                        </span>
                        <span v-else-if="$unPrefix(domainIRI)">
                          {{ $unPrefix(domainIRI) }}
                        </span>
                        <span v-else>
                          {{ domainIRI }}
                        </span>
                      </a>
                    </template>
                  </nav>
                </typeahead>
              </div>
              <div class="column">
                <typeahead
                  :readonly="readonly"
                  :search-function="classesSearch"
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
                    <p
                      v-show="proposalObject['isEdit'] && proposalObject['rangesRemoved'].length"
                      class="is-size-7">
                      Added:
                    </p>
                    <a
                      v-for="(range, index) in proposalObject['ranges']"
                      :key="index + 10000"
                      class="panel-block is-active">
                      <span
                        v-show="!readonly"
                        class="panel-icon"
                        @click.prevent="unselectRange(index)">
                        <i class="mdi mdi-close-circle" />
                      </span>
                      <span v-if="!range.label && range.predicate.value === $termIRI.a.value">
                        {{ term(range.subject) }}
                      </span>
                      <span v-else>
                        {{ (range.object && range.object.value || term(range.object)) || range.label }}
                      </span>
                    </a>
                    <template v-if="proposalObject['isEdit'] && readonly">
                      <p
                        v-show="proposalObject['rangesRemoved'].length"
                        class="is-size-7">
                        Removed:
                      </p>
                      <a
                        v-for="(rangeIRI, index) in proposalObject['rangesRemoved']"
                        :key="index"
                        class="panel-block is-active">
                        <span v-if="_get($labelQuadForIRI(ontology, rangeIRI), 'object.value')">
                          {{ _get($labelQuadForIRI(ontology, rangeIRI), 'object.value') }}
                        </span>
                        <span v-else-if="$unPrefix(rangeIRI)">
                          {{ $unPrefix(rangeIRI) }}
                        </span>
                        <span v-else>
                          {{ rangeIRI }}
                        </span>
                      </a>
                    </template>
                  </nav>
                </typeahead>
              </div>
            </div>
          </no-ssr>
        </div>

        <div
          v-show="subform && !readonly"
          class="columns subform-actions">
          <div class="column is-6">
            <button
              class="button is-info subform-submit"
              :readonly="!canContinue"
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

      <template v-if="proposalObject['classChildren'] && proposalObject['classChildren'].length">
        <class-form
          v-for="(newClass, index) in proposalObject['classChildren']"
          :key="index"
          :subform="true"
          :iri="iri"
          :readonly="readonly"
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
              v-if="proposalObject['isEdit']"
              class="subtitle collapsed-title">
              Changed Property "<em>{{ proposalObject['label'] }}</em>"
            </h2>
            <h2
              v-else
              class="subtitle collapsed-title">
              New Property "<em>{{ proposalObject['label'] }}</em>"
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
import { debounce, normalizeLabel, term } from '@/libs/utils'
import Typeahead from './Typeahead'
import Editor from '@/components/editor/Editor'

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
      // TODO: a single place in the store for this instead of one per proposal type ?
      default: 'prop.prop'
    },
    readonly: {
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
    if (process.browser && this.readonly !== true) {
      let maxRetry = 20
      setTimeout(() => {
        const waitForYate = setInterval(() => {
          if (window.YATE && this.$refs.exampleTextarea) {
            clearInterval(waitForYate)
            this.yate = window.YATE.fromTextArea(this.$refs.exampleTextarea, {
              readOnly: this.readonly,
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
      classesSearch: () => ([]),
      propertiesSearch: () => ([]),
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
      this.$vuexSet(`${this.storePath}.iri`, this.proposalObject['baseIRI'] + normalizeLabel(this.proposalObject['label'], 'camel'))
    },
    '$parent.proposalObject.label' () {
      this.onParentIRIChange()
    }
  },
  methods: {
    term,
    _get,
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
      this.$vuexPush('domains', this.$labelQuadForIRI(this.ontology, searchResult.iri))
    },
    onParentIRIChange: debounce(function () {
      if (this.subform) {
        const parentLabelQuad = this.$labelQuadForIRI(this.$parent.datasets.ontology, this.$parent.proposalObject.iri)
        this.$vuexSet(`${this.storePath}.domains[0]`, parentLabelQuad)
      }
    }, 400),
    unselectDomain (index) {
      const domain = this.proposalObject[`domains[${index}]`]
      const childIndex = this.proposalObject['classChildren'].indexOf(domain)
      this.$vuexDeleteAtIndex('classChildren', childIndex)
      this.$vuexDeleteAtIndex('domains', index)

      if (this.proposalObject['isEdit']) {
        this.$vuexPush('domainsRemoved', domain.subject.value)
      }
    },
    selectRange (searchResult) {
      const range = searchResult.domain

      const unRemove = this.proposalObject['rangesRemoved'].indexOf(searchResult.domain.subject.value)
      if (unRemove !== -1) {
        this.$vuexDeleteAtIndex('rangesRemoved', unRemove)
        return
      }
      // don't add if already in there
      const isSelected = ({ subject }) => term(subject) === term(range.subject)
      if (this.proposalObject['ranges'].find(isSelected)) {
        return
      }
      this.$vuexPush('ranges', range)
    },
    unselectRange (index) {
      const range = this.proposalObject[`ranges[${index}]`]
      const childIndex = this.proposalObject['classChildren'].indexOf(range)
      this.$vuexDeleteAtIndex('classChildren', childIndex)
      this.$vuexDeleteAtIndex('ranges', index)

      if (this.proposalObject['isEdit']) {
        this.$vuexPush('rangesRemoved', range.subject.value)
      }
    },
    selectSameAs (searchResult) {
      const sameAs = searchResult.domain

      const unRemove = this.proposalObject['sameAsRemoved'].indexOf(searchResult.domain.subject.value)
      if (unRemove !== -1) {
        this.$vuexDeleteAtIndex('sameAsRemoved', unRemove)
        return
      }
      // don't add if already in there
      const isSelected = ({ subject }) => term(subject) === term(sameAs.subject)
      if (this.proposalObject['sameAs'].find(isSelected)) {
        return
      }
      this.$vuexPush('sameAs', sameAs)
    },
    unselectSameAs (index) {
      const sameAs = this.proposalObject[`sameAs[${index}]`]
      this.$vuexDeleteAtIndex('sameAs', index)

      if (this.proposalObject['isEdit']) {
        this.$vuexPush('sameAsRemoved', sameAs.subject.value)
      }
    },
    createDomain (label) {
      const clss = new this.$Class({ label, isNew: true })
      // should we push 'this.prop' into 'clss' here?
      // or do something like :parentProp="prop" on <class-form in here and display it there?
      this.$vuexPush('domains', clss)
      this.$vuexPush('classChildren', clss)
      return true
    },
    createRange (label) {
      const clss = new this.$Class({ label, isNew: true })
      this.$vuexPush('ranges', clss)
      this.$vuexPush('classChildren', clss)
      return true
    },
    addExternalRange (iri) {
      this.$vuexPush('ranges', this.$externalIRIToQuad(iri))
      const unRemove = this.proposalObject['rangesRemoved'].indexOf(iri)
      if (unRemove !== -1) {
        this.$vuexDeleteAtIndex('rangesRemoved', unRemove)
        return true
      }
      return true
    },
    addExternalSameAs (iri) {
      this.$vuexPush('sameAs', this.$externalIRIToQuad(iri))
      const unRemove = this.proposalObject['sameAsRemoved'].indexOf(iri)
      if (unRemove !== -1) {
        this.$vuexDeleteAtIndex('sameAsRemoved', unRemove)
        return true
      }
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
      this.classesSearch = this.$domainsSearchFactory(this.ontology, 'Class', true)
      this.propertiesSearch = this.$domainsSearchFactory(this.ontology, 'Property', true)
      this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
      if (!this.subform) {
        if (this.edit) {
          const originalIRI = this.proposalObject['originalIRI'] || this.proposalObject['iri']
          this.$vuexSet(`${this.storePath}.originalIRI`, originalIRI)
        }
        if (this.proposalObject['domains.length'] === 0) {
          const currentLabelQuad = this.$labelQuadForIRI(this.ontology, this.iri)
          this.$vuexPush('domains', currentLabelQuad)
        }
      }
      this.onParentIRIChange()
    },
    displayNewSameAs (sameAs) {
      if (!sameAs.label && sameAs.predicate.value === this.$termIRI.a.value) {
        return term(sameAs.subject)
      }

      return ((sameAs.object && sameAs.object.value) || term(sameAs.object)) || sameAs.label
    }
  }
}
</script>
