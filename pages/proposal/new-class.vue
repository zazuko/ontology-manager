<template>
  <div>
    <section class="section">

      <div class="container">

        <h1 class="title">
          New Class Request<span
            v-show="cls.name">:
            "{{ cls.name }}"
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

        <div
          v-if="error"
          class="field">
          <p
            class="help is-danger">
            {{ error }}
          </p>
        </div>
        <div class="field is-grouped">
          <p class="control">
            <button
              class="button is-primary"
              @click="createProposal"
              :disabled="!!error">
              Submit Proposal
            </button>
          </p>
          <p class="control">
            <button class="button">
              Cancel
            </button>
          </p>
        </div>

        <div
          v-show="!error"
          class="box">
          <div class="field">
            <label class="label">NTriples preview</label>
            <div class="control">
              <pre>{{ nt }}</pre>
            </div>
          </div>
        </div>

      </div>

    </section>
  </div>
</template>

<script>
import axios from 'axios'
import _get from 'lodash/get'
import { datasetsSetup } from '@/libs/utils'
import { Cls, domainsSearchFactory } from '@/libs/rdf'
import Typeahead from '@/components/Typeahead'
import PropertiesTable from '@/components/PropertiesTable'

export default {
  async asyncData ({ query }) {
    return {
      iri: query.iri
    }
  },
  middleware: 'authenticated',
  components: {
    Typeahead,
    PropertiesTable
  },
  async created () {
    await datasetsSetup(this.$store)
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
      cls: new Cls(),
      searchFunction: () => ([]),
      domains: [],
      contentNT: '',
      motivation: '',
      renderTypeahead: process.client,
      error: 'Some required fields are empty!'
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
        this.contentNT = await this.cls.toNT()
        this.error = ''
      } catch (err) {
        this.contentNT = err.message
        this.error = err.message
      }
    },
    addDomain (domain) {
      if (!this.cls.domains.includes(domain.domain.subject)) {
        this.domains.push(domain)
        this.cls.domains.push(domain.domain.subject)
      }
    },
    removeDomain (index) {
      this.domains.splice(index, 1)
      this.cls.domains.splice(index, 1)
    },
    async createProposal () {
      const fileContent = await this.cls.toNT(window.ontology)
      const body = {
        title: `New class '${this.cls.name}'`,
        message: `add class '${this.cls.name}'`,
        body: this.motivation,
        iri: this.iri,
        content: fileContent
      }

      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        const result = await axios.post('/api/proposal/new', body, headers)

        const id = _get(result, 'data.createThread.thread.id')
        if (id) {
          this.$router.push({ name: 'proposal-id', params: { id } })
        } else {
          console.error('Failed to redirect', result)
        }
      } catch (err) {
        console.error(err)
      }
    },
    invalidClassname (name) {
      return !/^([A-Z])/.test(name)
    }
  },
  validate ({ query }) {
    return !!query.iri
  }
}
</script>
