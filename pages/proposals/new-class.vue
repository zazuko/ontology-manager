<template>
  <div>
    <section class="section">

      <div class="container">

        <h1 class="title">
          Request New Class
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
                <label class="label">Suggested Class Name</label>
                <div class="control">
                  <input
                    class="input"
                    type="text"
                    value="rdfs:Class">
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
                    placeholder="">
                    rdfs:label
                  </textarea>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label">Long Description (optional)</label>
                <div class="control">
                  <textarea
                    class="textarea"
                    placeholder="">
                    rdfs:comment
                  </textarea>
                </div>
              </div>
            </div>
          </div>

          <hr>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">Has the Following Properties</label>
                <div class="control">
                  <!--
                  if click on 'add as new property',
                  we add a box and add it to the progression
                -->
                  <input
                    class="input"
                    type="text"
                    value="weight schema:domainIncludes MyNewClass">
                </div>
              </div>
            </div>
            <div class="column" />
          </div>

          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Property</th>
                <th>Expected Type</th>
                <th>Description</th>
                <th>Used On</th>
                <th>foo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>38</td>
                <td>23</td>
                <td>12</td>
                <td>3</td>
                <td>edit remove</td>
              </tr>
            </tbody>
          </table>

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

export default {
  async asyncData ({ query }) {
    return {
      iri: query.iri
    }
  },
  middleware: 'authenticated',
  async created () {
    await datasetsSetup(this.$store)
  },
  methods: {
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
