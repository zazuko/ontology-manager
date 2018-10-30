<template>
  <div
    :class="{ 'is-class-subform': subform }">

    <div
      v-if="!clss['done']">
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

      <div
        :class="{
          'is-marginless': clss['propChildren.length'],
          'has-prop-subform': clss['propChildren.length'],
        }"
        class="box">

        <div class="columns">
          <div class="column is-8">
            <h2 class="title">New Class <span v-show="clss['label']">"<em>{{ clss['label'] }}</em>"</span></h2>
            <p
              v-show="clss['iri']"
              class="subtitle">
              <code>{{ clss['iri'] }}</code>
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
                <label class="label">Class Name</label>
                <div class="control">
                  <input
                    :class="{'is-danger': !clss['label']}"
                    class="input"
                    autocomplete="new-password"
                    type="text"
                    v-debounce
                    v-model.lazy="clss['label']">
                </div>
                <p
                  v-if="clss['label'] && invalidClassname(clss['label'])"
                  class="help is-danger">
                  Class name must start with an <strong>Uppercase</strong> letter!
                </p>
                <p
                  v-else-if="!clss['label']"
                  class="help is-danger">
                  Please enter the class name.
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
          </div>
          <div class="column">
            <div class="field">
              <label class="label">Long Description (optional)</label>
              <div class="control">
                <textarea
                  class="textarea"
                  v-debounce
                  v-model.lazy="clss['description']" />
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
                :search-function="searchFunction"
                label="Has the Following Properties"
                @selectionChanged="selectDomain">
                <div
                  v-if="typeahead.inputString && canCreateProperty(typeahead.inputString)"
                  slot="custom-options"
                  slot-scope="typeahead"
                  class="dropdown-item">
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

        <properties-table
          v-if="clss['domains.length']"
          slot="selected-list"
          :properties="clss['domains']"
          :dataset="mergedDatasets.ontology"
          @delete="unselectDomain" />

        <div
          v-show="subform"
          class="columns">
          <div class="column">
            <button
              class="button is-success"
              :disabled="!validBase"
              @click.prevent="$vuexSet(`${storePath}.done`, true)">
              Add "<em>{{ clss['label'] }}</em>" to the proposal
            </button>
          </div>
        </div>

      </div>

      <div v-if="clss['propChildren'] && clss['propChildren'].length">
        <new-property-form
          v-for="(newProp, index) in clss['propChildren']"
          :key="index"
          :subform="true"
          :iri="iri"
          :store-path="`${storePath}.propChildren[${index}]`"
          :base-datasets="mergedDatasets" />
      </div>
      <div v-else />

      <!--<div class="box">
        <div class="field">
          <label class="label">Example</label>
          <div class="control">
            <textarea
              v-debounce
              v-model.lazy="clss['example']"
              class="textarea"
              placeholder="" />
          </div>
        </div>
      </div>-->

      <slot />

    </div>
    <div v-else>

      <div class="box">
        <div class="columns">
          <div class="column is-8">
            <h2 class="subtitle">New Class "<em>{{ clss['label'] }}</em>"</h2>
          </div>
          <div class="column">
            <button
              @click.prevent="$vuexSet(`${storePath}.done`, false)"
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
import { domainsSearchFactory, term, normalizeLabel } from '@/libs/rdf'
import { datasetsSetup } from '@/libs/utils'
import Typeahead from '@/components/Typeahead'
import PropertiesTable from '@/components/PropertiesTable'
import { Property } from '@/models/Property'
import { toDataset, toNT } from '@/models/Class'

export default {
  name: 'NewClassForm',
  props: {
    iri: {
      type: String,
      required: true
    },
    storePath: {
      type: String,
      required: false,
      default: () => 'class.clss'
    },
    baseDatasets: {
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
    NewPropertyForm: () => import('@/components/NewPropertyForm'),
    PropertiesTable,
    Typeahead
  },
  async mounted () {
    await this.init()
  },
  data () {
    return {
      searchFunction: () => ([]),
      renderTypeahead: process.client,
      ontology: null,
      structure: null,
      debugNT: ''
    }
  },
  computed: {
    datasets () {
      return toDataset(this.clss, false)
    },
    clss () {
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
        toDataset(this.clss)
        return true
      } catch (err) {
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
      const childIndex = this.clss['propChildren'].indexOf(this.clss[`domains[${index}]`])
      this.$vuexDeleteAtIndex('propChildren', childIndex)
      this.$vuexDeleteAtIndex('domains', index)
    },
    canCreateProperty (label) {
      return /^([a-z])/.test(label)
    },
    createProperty (label) {
      const prop = new Property(label)
      this.$vuexPush('domains', prop)
      this.$vuexPush('propChildren', prop)
      return true
    },
    invalidClassname (label) {
      return !/^([A-Z])/.test(label)
    },
    async init () {
      await datasetsSetup(this.$store)

      let i = setInterval(() => {
        if (typeof window !== 'undefined') {
          clearInterval(i)

          if (this.baseDatasets) {
            this.ontology = this.baseDatasets.ontology
            this.structure = this.baseDatasets.structure
          } else {
            this.ontology = window.ontology
            this.structure = window.structure
          }
          this.searchFunction = domainsSearchFactory(this.ontology, 'Property', false)
          this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
        }
      })
    },
    debugGenerateNT () {
      const datasets = toDataset(this.clss, false)
      this.debugNT = toNT(null, datasets.ontology)
      this.debugNT += `\n\n${'-'.repeat(20)}\n\n`
      this.debugNT += toNT(null, datasets.structure)
    }
  }
}
</script>
