<template>
  <div
    :class="{ subform }">
    <div class="box">

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Class Name</label>
            <div class="control">
              <input
                :class="{'is-danger': !clss['label']}"
                class="input"
                autocomplete="new-password"
                type="text"
                v-model="clss['label']">
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
        <div class="column">
          <p
            v-if="clss['label'] && !invalidClassname(clss['label'])">
            <code>
              {{ clss['iri'] }}
            </code>
          </p>
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
                v-model="clss['comment']" />
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
                v-model="clss['description']" />
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
                  property "{{ typeahead.inputString }}" ?
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
        :dataset="mergedOntology"
        @delete="unselectDomain" />

    </div>

    <new-property-form
      v-for="(newProp, index) in clss['propChildren']"
      :key="index"
      :subform="true"
      :iri="iri"
      :parent-dataset="dataset"
      :store-path="`${storePath}.propChildren[${index}]`"
      :ontology-base="mergedOntology" />

    <div class="box">
      <div class="field">
        <label class="label">Example</label>
        <div class="control">
          <textarea
            v-model="clss['example']"
            class="textarea"
            placeholder="" />
        </div>
      </div>
    </div>

    <slot />

  </div>
</template>

<script>
import { domainsSearchFactory, term, normalizeLabel } from '@/libs/rdf'
import { datasetsSetup } from '@/libs/utils'
import NewPropertyForm from '@/components/NewPropertyForm'
import Typeahead from '@/components/Typeahead'
import PropertiesTable from '@/components/PropertiesTable'
import { Property } from '@/models/Property'
import { toDataset } from '@/models/Class'

export default {
  name: 'NewClassForm',
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
      default: () => 'class.clss'
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
    PropertiesTable,
    Typeahead,
    NewPropertyForm
  },
  async created () {
    await datasetsSetup(this.$store)
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        clearInterval(i)

        this.ontology = this.ontologyBase || window.ontology
        this.searchFunction = domainsSearchFactory(this.ontology, 'Property', false)
        this.$vuexSet(`${this.storePath}.parentStructureIRI`, this.iri)
      }
    })
  },
  data () {
    return {
      ontology: {},
      searchFunction: () => ([]),
      renderTypeahead: process.client
    }
  },
  computed: {
    dataset () {
      return toDataset(this.clss, false)
    },
    clss () {
      return this.$deepModel(this.storePath)
    },
    mergedOntology () {
      return this.dataset.clone().merge(this.ontology)
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
      this.$vuexDeleteAtIndex('domains', index)
    },
    canCreateProperty (label) {
      return /^([a-z])/.test(label)
    },
    createProperty (label) {
      const prop = new Property()
      prop.label = label
      this.$vuexPush('domains', prop)
      this.$vuexPush('propChildren', prop)
      return true
    },
    invalidClassname (label) {
      return !/^([A-Z])/.test(label)
    }
  }
}
</script>
