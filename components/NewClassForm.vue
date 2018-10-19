<template>
  <div>
    <div class="box">
      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Class Name</label>
            <div class="control">
              <input
                :class="{'is-danger': !cls.name}"
                class="input"
                autocomplete="new-password"
                type="text"
                v-model="cls.name">
            </div>
            <p
              v-if="cls.name && invalidClassname(cls.name)"
              class="help is-danger">
              Class name must start with an Uppercase letter!
            </p>
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
                :class="{'is-danger': !cls.shortDescription}"
                v-model="cls.shortDescription" />
            </div>
          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">Long Description (optional)</label>
            <div class="control">
              <textarea
                class="textarea"
                v-model="cls.longDescription" />
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
              @selectionChanged="addDomain" />
          </div>
          <div v-else />
        </div>
        <div class="column" />
      </div>

      <properties-table
        v-if="domains.length"
        slot="selected-list"
        :properties="domains"
        @delete="removeDomain" />

    </div>

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
import { domainsSearchFactory } from '@/libs/rdf'
import Typeahead from '@/components/Typeahead'
import PropertiesTable from '@/components/PropertiesTable'

export default {
  name: 'NewClassForm',
  props: {
    iri: {
      type: String,
      required: true
    },
    cls: {
      type: Object,
      required: true
    }
  },
  components: {
    PropertiesTable,
    Typeahead
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        clearInterval(i)

        this.ontology = window.ontology
        this.searchFunction = domainsSearchFactory(this.ontology, 'Property', false)
      }
    })
  },
  data () {
    return {
      currentLabel: '',
      searchFunction: () => ([]),
      domains: [],
      motivation: '',
      renderTypeahead: process.client
    }
  },
  methods: {
    addDomain (domain) {
      const domainIRI = domain.key
      if (!this.cls.domains.find(({ value }) => value === domainIRI) && this.iri !== domainIRI) {
        this.domains.push(domain)
        this.cls.domains.push(domain.domain.subject)
      }
    },
    removeDomain (index) {
      this.domains.splice(index, 1)
      this.cls.domains.splice(index, 1)
    },
    addType (type) {
      type.domain.subject.label = type.label
      this.cls.type = type.domain.subject
    },
    removeType () {
      this.cls.type = ''
    },
    createProposal () {
      this.$emit('submitClass')
    },
    invalidClassname (name) {
      return !/^([A-Z])/.test(name)
    }
    // couldCreateClass (name) {
    //   if (this.cls.domains.includes(name)) {
    //     return false
    //   }
    //   if (this.iri === name) {
    //     return false
    //   }
    //   return /^([A-Z])/.test(name)
    // }
  }
}
</script>
