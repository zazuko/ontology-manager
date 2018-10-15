<template>
  <div>
    <section class="section">

      <div class="container">

        <h1 class="title">
          Property Request<span
            v-show="property.name">:
            "{{ property.name }}"
          </span>
        </h1>
        <h2 class="subtitle">
          On <code>{{ iri }}</code>
        </h2>
        <p>
          This form allows suggesting new elements to include in the ontology.
        </p>
        <p>
          Once submitted, the proposal will be discussed and eventually accepted or rejected by official team members.
        </p>

        <div class="box">
          <div class="field">
            <label class="label">Motivation</label>
            <div class="columns">
              <div class="column">
                <div class="control">
                  <textarea
                    v-model="motivation"
                    class="textarea"
                    placeholder="" />
                </div>
              </div>
              <div class="column">
                <p>
                  In your motivation, please mention involved parties and other supportive
                  entities, what shortcoming this proposal is expected to overcome
                  or what purpose it serves.
                </p>
              </div>
            </div>
          </div>
        </div>

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
                  :search-function="sfn"
                  label="Applies to the Following Classes"
                  @selectionChanged="addDomain">
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
                  :search-function="sfn"
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
            <label class="label">NT so far</label>
            <div class="control">
              <pre>{{ nt }}</pre>
            </div>
          </div>
        </div>

        <div class="box">
          <div class="field">
            <label class="label">Example</label>
            <div class="control">
              <textarea
                class="textarea"
                placeholder="" />
            </div>
          </div>
        </div>

        <div class="field is-grouped">
          <p class="control">
            <button
              class="button is-primary"
              @click="createProposal">
              Submit Proposal
            </button>
          </p>
          <p class="control">
            <button class="button">
              Cancel
            </button>
          </p>
        </div>

      </div>

    </section>
  </div>
</template>

<script>
import axios from 'axios'
import _get from 'lodash/get'
import { datasetsSetup } from '@/libs/utils'
import { Property, domainsSearchFactory, labelQuadForIRI } from '@/libs/rdf'
import Typeahead from '@/components/Typeahead'

export default {
  async asyncData ({ query }) {
    return {
      iri: query.iri
    }
  },
  middleware: 'authenticated',
  components: {
    Typeahead
  },
  async created () {
    await datasetsSetup(this.$store)
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        clearInterval(i)

        this.ontology = window.ontology
        this.sfn = domainsSearchFactory(this.ontology, 'Class', true)
        const currentLableQuad = labelQuadForIRI(this.iri, this.ontology)
        this.currentLabel = currentLableQuad.object.value
        this.property.domains.push(currentLableQuad.subject)
      }
    })
  },
  data () {
    return {
      currentLabel: '',
      property: new Property(),
      sfn: () => ([]),
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
      this.domains.push(domain)
      this.property.domains.push(domain.domain.subject)
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
    async createProposal () {
      const fileContent = await this.property.toNT(window.ontology)
      const body = {
        title: `New property '${this.property.name}' on '${this.iri}'`,
        message: `add property '${this.property.name}' to '${this.iri}'`,
        body: this.motivation,
        iri: this.iri,
        content: fileContent
      }

      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        const result = await axios.post('/api/proposals/new', body, headers)

        const id = _get(result, 'data.createThread.thread.id')
        if (id) {
          this.$router.push({ name: 'proposals-id', params: { id } })
        } else {
          console.error('Failed to redirect', result)
        }
      } catch (err) {
        console.error(err)
      }
    }
  },
  validate ({ query }) {
    return !!query.iri
  }
}
</script>
