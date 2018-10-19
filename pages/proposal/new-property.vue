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

        <new-property-form
          :iri="iri"
          :property="property"
          @submitProperty="createProposal">

          <div class="box">
            <div class="field">
              <label class="label">NT so far</label>
              <div class="control">
                <pre>{{ nt }}</pre>
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

        </new-property-form>

      </div>

    </section>
  </div>
</template>

<script>
import axios from 'axios'
import _get from 'lodash/get'
import { datasetsSetup } from '@/libs/utils'
import { Property } from '@/libs/rdf'
import NewPropertyForm from '@/components/NewPropertyForm'

export default {
  async asyncData ({ query }) {
    return {
      iri: query.iri
    }
  },
  middleware: 'authenticated',
  components: {
    NewPropertyForm
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
      property: new Property(),
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
