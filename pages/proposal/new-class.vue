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

        <new-class-form
          :iri="iri"
          :cls="cls"
          @submitClass="createProposal">

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
                <pre>{{ nt1 }}</pre>
                <pre>{{ nt2 }}</pre>
              </div>
            </div>
          </div>

        </new-class-form>

      </div>

    </section>
  </div>
</template>

<script>
import axios from 'axios'
import _get from 'lodash/get'
import { datasetsSetup } from '@/libs/utils'
import { Cls } from '@/libs/rdf'
import NewClassForm from '@/components/NewClassForm'

export default {
  async asyncData ({ query }) {
    return {
      iri: query.iri
    }
  },
  middleware: 'authenticated',
  components: {
    NewClassForm
  },
  async created () {
    await datasetsSetup(this.$store)
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        clearInterval(i)

        this.ontology = window.ontology
      }
    })
  },
  data () {
    return {
      cls: new Cls(),
      contentNT1: '',
      contentNT2: '',
      motivation: '',
      error: 'Some required fields are empty!'
    }
  },
  computed: {
    nt1 () {
      this.setNT()
      return this.contentNT1
    },
    nt2 () {
      return this.contentNT2
    }
  },
  methods: {
    async setNT () {
      this.cls.parentStructureIRI = this.iri
      try {
        this.contentNT1 = await this.cls.toNT()
        this.contentNT2 = await this.cls.toStructureNT()
        this.error = ''
      } catch (err) {
        this.contentNT1 = err.message
        this.error = err.message
      }
    },
    async createProposal () {
      const ontologyContent = await this.cls.toNT(window.ontology)
      const structureContent = await this.cls.toStructureNT(window.structure)

      const body = {
        title: `New class '${this.cls.name}'`,
        message: `add class '${this.cls.name}'`,
        body: this.motivation,
        iri: this.iri,
        ontologyContent,
        structureContent
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
    }
  },
  validate ({ query }) {
    return !!query.iri
  }
}
</script>
