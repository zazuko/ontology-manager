<template>
  <div
    :id="proposalObject['label']"
    :class="{
      'is-class-form': !subform,
      'is-class-subform': subform,
      'is-subform': subform,
      'proposal-draft': !readonly
    }">

    <template v-if="readonly || !proposalObject['isSubFormCollapsed']">

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
                  :readonly="readonly"
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
                  :readonly="readonly"
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
          class="fold">
          <div class="columns">
            <div class="column is-6">
              <typeahead
                :readonly="readonly"
                :search-function="classesSearch"
                label="Equivalent Class (owl:equivalentClass)"
                @selectionChanged="selectEquivalentClass">
                <div
                  v-if="typeahead.inputString"
                  slot="custom-options"
                  slot-scope="typeahead"
                  class="dropdown-item">
                  <span v-if="typeahead.inputString.startsWith('http')">
                    <a
                      title="Add external owl:equivalentClass IRI"
                      @click.prevent="addExternalEquivalentClass(typeahead.inputString) && typeahead.hide()">
                      External equivalentClass: "{{ typeahead.inputString }}"
                    </a>
                  </span>
                </div>
                <nav
                  slot="selected-list"
                  class="panel">
                  <a
                    v-for="(equivalentClass, index) in proposalObject['equivalentClass']"
                    :key="index"
                    class="panel-block is-active">
                    <p
                      v-show="proposalObject['isEdit'] && proposalObject['equivalentClassRemoved'].length"
                      class="is-size-7">
                      Added:
                    </p>
                    <span
                      v-show="!readonly"
                      class="panel-icon"
                      @click.prevent="unselectEquivalentClass(index)">
                      <close-circle />
                    </span>
                    {{ displayNewEquivalentClass(equivalentClass) }}
                  </a>
                  <template v-if="proposalObject['isEdit'] && readonly">
                    <p
                      v-show="proposalObject['equivalentClassRemoved'].length"
                      class="is-size-7">
                      Removed:
                    </p>
                    <a
                      v-for="(equivalentClassIRI, index) in proposalObject['equivalentClassRemoved']"
                      :key="index"
                      class="panel-block is-active">
                      <span v-if="_get($labelQuadForIRI(ontology, equivalentClassIRI), 'object.value')">
                        {{ _get($labelQuadForIRI(ontology, equivalentClassIRI), 'object.value') }}
                      </span>
                      <span v-else-if="$unPrefix(equivalentClassIRI)">
                        {{ $unPrefix(equivalentClassIRI) }}
                      </span>
                      <span v-else>
                        {{ equivalentClassIRI }}
                      </span>
                    </a>
                  </template>
                </nav>
              </typeahead>
            </div>

            <div class="column is-6">
              <typeahead
                :readonly="readonly"
                :search-function="classesSearch"
                label="Subclass Of (rdfs:subClassOf)"
                @selectionChanged="selectSubClass">
                <div
                  v-if="typeahead.inputString"
                  slot="custom-options"
                  slot-scope="typeahead"
                  class="dropdown-item">
                  <span v-if="typeahead.inputString.startsWith('http')">
                    <a
                      title="Add external rdfs:subClassOf IRI"
                      @click.prevent="addExternalSubClass(typeahead.inputString) && typeahead.hide()">
                      External subClassOf: "{{ typeahead.inputString }}"
                    </a>
                  </span>
                </div>
                <nav
                  slot="selected-list"
                  class="panel">
                  <template v-if="proposalObject['subClass']">
                    <p
                      v-show="proposalObject['isEdit'] && proposalObject['subClassRemoved'].length"
                      class="is-size-7">
                      Added:
                    </p>
                    <a class="panel-block is-active">
                      <span
                        v-show="!readonly"
                        class="panel-icon"
                        @click.prevent="unselectSubClass(proposalObject['subClass'])">
                        <close-circle />
                      </span>
                      {{ displayNewSubClass(proposalObject['subClass']) }}
                    </a>
                  </template>
                  <template v-if="proposalObject['isEdit']">
                    <p
                      v-show="proposalObject['subClassRemoved'].length"
                      class="is-size-7">
                      Removed:
                    </p>
                    <a
                      v-for="(subClassIRI, index) in proposalObject['subClassRemoved']"
                      :key="index"
                      class="panel-block is-active">
                      <span v-if="_get($labelQuadForIRI(ontology, subClassIRI), 'object.value')">
                        {{ _get($labelQuadForIRI(ontology, subClassIRI), 'object.value') }}
                      </span>
                      <span v-else-if="$unPrefix(subClassIRI)">
                        {{ $unPrefix(subClassIRI) }}
                      </span>
                      <span v-else>
                        {{ subClassIRI }}
                      </span>
                    </a>
                  </template>
                </nav>
              </typeahead>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <client-only>
                <typeahead
                  :readonly="readonly"
                  :search-function="propertiesSearch"
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
              </client-only>
            </div>
            <div class="column" />
          </div>

        </div>

        <proposal-properties-table
          v-if="proposalObject['domains.length']"
          :iri="proposalObject['iri']"
          :readonly="readonly"
          :properties="proposalObject['domains']"
          :removed-properties="proposalObject['domainsRemoved']"
          :store-path="storePath"
          :dataset="mergedDatasets.ontology"
          @reselectDomain="reselectDomain"
          @delete="unselectDomain" />

        <div
          v-show="subform && !readonly"
          class="columns subform-actions">
          <div class="column is-6">
            <button
              class="button is-info subform-submit"
              :readonly="!validBase"
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
          :readonly="readonly"
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
import cloneDeep from 'lodash/cloneDeep'
import rdf from 'rdf-ext'
import { buildAdjacencyList, isCyclic, normalizeLabel, term, toastClose } from '@/libs/utils'
import Typeahead from './Typeahead'
import Editor from '@/components/editor/Editor'
import ProposalPropertiesTable from './ProposalPropertiesTable'
import CloseCircle from 'vue-material-design-icons/CloseCircle.vue'

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
    PropertyForm: () => import('@/components/proposal/PropertyForm'),
    ProposalPropertiesTable,
    Editor,
    Typeahead,
    CloseCircle
  },
  mounted () {
    this.init()
    if (process.browser && this.readonly !== true) {
      setTimeout(() => {
        this.waitForYate = setInterval(() => {
          if (window.YATE && this.$refs.exampleTextarea && this.proposalObject.label) {
            clearInterval(this.waitForYate)
            this.yate = window.YATE.fromTextArea(this.$refs.exampleTextarea, {
              readOnly: this.readonly,
              value: this.proposalObject.example
            })
            this.yate.on('change', cm => {
              this.proposalObject.example = cm.getValue()
            })
          }
        }, 300)
      }, 300)
    }
  },
  beforeDestroy () {
    clearInterval(this.waitForYate)
  },
  data () {
    return {
      schemaTree: {},
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
      this.$vuexSet(`${this.storePath}.iri`, this.proposalObject.baseIRI + normalizeLabel(this.proposalObject.label, 'pascal'))
    }
  },
  methods: {
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
      if (this.proposalObject.domains.find(isSelected) || this.iri === term(domain.subject)) {
        return
      }

      this.$vuexPush('domains', searchResult)
    },
    unselectDomain (index) {
      const domain = this.proposalObject.domains[index]
      const childIndex = this.proposalObject.propChildren.indexOf(domain)
      this.$vuexDeleteAtIndex('propChildren', childIndex)
      this.$vuexDeleteAtIndex('domains', index)

      if (this.proposalObject.isEdit) {
        this.$vuexPush('domainsRemoved', domain)
      }
    },
    reselectDomain (index) {
      const domain = this.proposalObject.domainsRemoved[index]
      this.$vuexPush('domains', domain)
      this.$vuexDeleteAtIndex('domainsRemoved', index)
    },
    selectEquivalentClass (searchResult) {
      const equivalentClass = searchResult.domain

      const unRemove = this.proposalObject.equivalentClassRemoved.indexOf(searchResult.domain.subject.value)
      if (unRemove !== -1) {
        this.$vuexDeleteAtIndex('equivalentClassRemoved', unRemove)
        return
      }
      // don't add if already in there
      const isSelected = ({ subject }) => term(subject) === term(equivalentClass.subject)
      if (this.proposalObject.equivalentClass.find(isSelected)) {
        return
      }
      this.$vuexPush('equivalentClass', equivalentClass)
    },
    selectSubClass (searchResult) {
      const subClass = searchResult.domain.subject.value

      const unRemove = this.proposalObject.subClassRemoved.indexOf(subClass)
      if (unRemove !== -1) {
        this.$vuexDeleteAtIndex('subClassRemoved', unRemove)
      }
      if (this.proposalObject.subClass && this.proposalObject.subClass.subject.value === subClass) {
        return
      }
      if (subClass === this.proposalObject.iri) {
        return
      }

      const adjacencyList = buildAdjacencyList(this.schemaTree)
      adjacencyList[subClass] = adjacencyList[subClass] || []
      adjacencyList[subClass].push(this.proposalObject.iri)
      if (isCyclic(adjacencyList)) {
        this.$toast.error('Cannot create cyclic subClassOf', toastClose).goAway(10000)
        return
      }

      this.$vuexSet(`${this.storePath}.subClass`, searchResult.domain)
    },
    unselectEquivalentClass (index) {
      const equivalentClass = this.proposalObject[`equivalentClass[${index}]`]
      this.$vuexDeleteAtIndex('equivalentClass', index)

      if (this.proposalObject.isEdit) {
        this.$vuexPush('equivalentClassRemoved', equivalentClass.subject.value)
      }
    },
    unselectSubClass (quad) {
      this.$vuexSet(`${this.storePath}.subClass`, null)

      if (this.proposalObject.isEdit) {
        this.$vuexPush('subClassRemoved', quad.subject.value)
      }
    },
    addExternalEquivalentClass (iri) {
      this.$vuexPush('equivalentClass', this.$externalIRIToQuad(iri))
      const unRemove = this.proposalObject.equivalentClassRemoved.indexOf(iri)
      if (unRemove !== -1) {
        this.$vuexDeleteAtIndex('equivalentClassRemoved', unRemove)
        return true
      }
      return true
    },
    addExternalSubClass (iri) {
      this.$vuexPush('subClass', this.$externalIRIToQuad(iri))
      const unRemove = this.proposalObject.subClassRemoved.indexOf(iri)
      if (unRemove !== -1) {
        this.$vuexDeleteAtIndex('subClassRemoved', unRemove)
        return true
      }
      return true
    },
    createProperty (label) {
      const prop = new this.$Property({ label, isNew: true })
      const conflicts = Boolean(this.ontology.match(rdf.namedNode(prop.iri), this.$termIRI.a).toArray().length)
      if (conflicts) {
        this.$toast.error(`Creating a property named "${label}" would conflict with existing object ${prop.iri}`)
        return false
      }
      this.$vuexPush('domains', prop)
      this.$vuexPush('propChildren', prop)
      return true
    },
    invalidClassname (label) {
      return !/^([A-Z])/.test(label)
    },
    displayNewEquivalentClass (equivalentClass) {
      if (!equivalentClass.label && equivalentClass.predicate.value === this.$termIRI.a.value) {
        return term(equivalentClass.subject)
      }

      return ((equivalentClass.object && equivalentClass.object.value) || term(equivalentClass.object)) || equivalentClass.label
    },
    displayNewSubClass (subClass) {
      if (!subClass.label && subClass.predicate.value === this.$termIRI.a.value) {
        return term(subClass.subject)
      }

      return ((subClass.object && subClass.object.value) || term(subClass.object)) || subClass.label
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
      this.schemaTree = cloneDeep(this.$store.state.graph.schemaTree)
      this.classesSearch = this.$domainsSearchFactory(this.ontology, 'Class', true)
      if (!this.subform && this.edit) {
        const originalIRI = this.proposalObject.originalIRI || this.proposalObject.iri
        this.$vuexSet(`${this.storePath}.originalIRI`, originalIRI)
      }
      this.propertiesSearch = this.$domainsSearchFactory(this.ontology, 'Property', false)
      this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
    }
  }
}
</script>
