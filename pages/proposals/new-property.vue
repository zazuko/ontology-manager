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
                    class="textarea"
                    placeholder="">
                    NOT RDF
                    not implemented / TODO
                  </textarea>
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
                    :class="{'is-danger': !property.longDescription}"
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
                      v-for="(domain, index) in domains"
                      :key="index"
                      class="panel-block">
                      <span
                        class="panel-icon"
                        @click.prevent="removeDomain(index)">
                        <i class="mdi mdi-close-circle" />
                      </span>
                      {{ domain.label }}
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
                    <a class="panel-block">
                      <span
                        class="panel-icon"
                        @click.prevent="removeType()">
                        <i class="mdi mdi-close-circle" />
                      </span>
                      <code
                        v-if="property.type">
                        {{ property.type.value }}
                      </code>
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
                placeholder=""
                v-html="paf()">
                NOT RDF
                not implemented / TODO
              </textarea>
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
import { Property, domainsSearchFactory } from '@/libs/rdf'
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
        this.ontology = window.ontology
        this.sfn = domainsSearchFactory(this.ontology)
        clearInterval(i)
      }
    })
  },
  data () {
    const property = new Property()
    return {
      property,
      sfn: () => ([]),
      domains: [],
      renderTypeahead: process.client
    }
  },
  methods: {
    paf () {
      try {
        return this.property.toQuads()
      } catch (err) {
        return err.message
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
      this.property.type = type.domain.subject
    },
    removeType () {
      this.property.type = ''
    },
    async createProposal () {
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        const result = await axios.post('/api/proposals/new', { iri: this.iri }, headers)

        const id = _get(result, 'createThread.thread.id')
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
