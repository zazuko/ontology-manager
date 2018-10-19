<template>
  <div>
    <div class="box">

      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Property Name</label>
            <div class="control">
              <input
                :class="{'is-danger': !property.name}"
                class="input"
                autocomplete="new-password"
                type="text"
                v-model="property.name">
            </div>
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
                :class="{'is-danger': !property.shortDescription}"
                v-model="property.shortDescription" />
            </div>
          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">Long Description (optional)</label>
            <div class="control">
              <textarea
                class="textarea"
                v-model="property.longDescription" />
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
              @selectionChanged="addDomain">
              <div
                v-if="typeahead.inputString && couldCreateClass(typeahead.inputString)"
                slot="custom-options"
                slot-scope="typeahead"
                class="dropdown-item">
                Create <a
                  title="Add as a new class"
                  @click.prevent="createClass(typeahead.inputString)">
                  class "{{ typeahead.inputString }}" ?
                </a>
              </div>
              <nav
                slot="selected-list"
                class="panel">
                <a
                  class="panel-block"
                  title="New property is getting created on this class!">
                  <span class="panel-icon">
                    <i class="mdi mdi-close-circle" />
                  </span>
                  {{ currentLabel }}
                  &nbsp;
                  <small>(<code>{{ iri }}</code>)</small>
                </a>
                <a
                  v-for="(domain, index) in domains"
                  :key="index"
                  class="panel-block is-active">
                  <span
                    class="panel-icon"
                    @click.prevent="removeDomain(index)">
                    <i class="mdi mdi-close-circle" />
                  </span>
                  {{ domain.label }}
                  &nbsp;
                  <small>(<code>{{ domain.domain.subject.value }}</code>)</small>
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
              @selectionChanged="addType">
              <nav
                v-show="property.type"
                slot="selected-list"
                class="panel">
                <a
                  v-if="property.type"
                  class="panel-block is-active">
                  <span
                    class="panel-icon"
                    @click.prevent="removeType()">
                    <i class="mdi mdi-close-circle" />
                  </span>
                  {{ property.type.label }}
                  &nbsp;
                  <small>(<code>{{ property.type.value }}</code>)</small>
                </a>
              </nav>
            </typeahead>
          </div>
          <div v-else />
        </div>
      </div>

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
import { domainsSearchFactory, labelQuadForIRI } from '@/libs/rdf'
import Typeahead from '@/components/Typeahead'

export default {
  name: 'NewPropertyForm',
  props: {
    iri: {
      type: String,
      required: true
    },
    property: {
      type: Object,
      required: true
    }
  },
  components: {
    Typeahead
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        clearInterval(i)

        this.ontology = window.ontology
        this.searchFunction = domainsSearchFactory(this.ontology, 'Class', true)
        const currentLabelQuad = labelQuadForIRI(this.iri, this.ontology)
        this.currentLabel = currentLabelQuad.object.value
        this.property.domains.push(currentLabelQuad.subject)
      }
    })
  },
  data () {
    return {
      currentLabel: '',
      searchFunction: () => ([]),
      domains: [],
      contentNT: '',
      motivation: '',
      renderTypeahead: process.client
    }
  },
  computed: {
    nt () {
      this.setNT()
      return this.contentNT
    }
  },
  methods: {
    async setNT () {
      try {
        this.contentNT = await this.property.toNT()
      } catch (err) {
        this.contentNT = err.message
      }
    },
    addDomain (domain) {
      const domainIRI = domain.domain.subject.value
      if (!this.property.domains.find(({ value }) => value === domainIRI) && this.iri !== domainIRI) {
        this.domains.push(domain)
        this.property.domains.push(domain.domain.subject)
      }
    },
    removeDomain (index) {
      this.domains.splice(index, 1)
      this.property.domains.splice(index, 1)
    },
    addType (type) {
      type.domain.subject.label = type.label
      this.property.type = type.domain.subject
    },
    removeType () {
      this.property.type = ''
    },
    createProposal () {
      this.$emit('submitProperty')
    },
    couldCreateClass (name) {
      if (this.property.domains.includes(name)) {
        return false
      }
      if (this.iri === name) {
        return false
      }
      return /^([A-Z])/.test(name)
    }
  }
}
</script>
