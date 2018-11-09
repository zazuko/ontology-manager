<template>
  <div>
    <section class="section">

      <div class="container">
        <div class="columns">
          <div class="column is-3" />
          <div class="column">
            <h1 class="title">
              New Class Request<span
                v-show="clss.label">:
                "{{ clss.label }}"
              </span>
            </h1>
            <h2 class="subtitle">
              On <code>{{ _iri }}</code>
            </h2>
            <p>
              This form allows suggesting new elements to include in the ontology.
            </p>
            <p>
              Once submitted, the proposal will be discussed and eventually accepted or rejected by official team members.
            </p>

          </div>
        </div>

        <div class="columns">
          <div class="column is-3">
            <div class="box">
              <p class="label">
                New Proposal Progression
              </p>
              <!-- <progress
                class="progress is-small is-success"
                value="15"
                max="100">15%</progress> -->
              <ul class="progression">
                <!-- loop over a computedProperty here, which contains all the steps -->
                <li
                  v-for="(step, index) in progressionSteps"
                  :key="index"
                  :class="{ done: step.check() }">
                  <span
                    v-if="step.html"
                    v-html="step.html" />
                  <span v-else>
                    {{ step.text }}
                  </span>
                  <span v-if="step.path">
                    <br>
                    {{ clss[step.path] }}
                  </span>
                  <span v-else />
                </li>
                <!-- … loop over classChildren and get path to check for steps -->
              </ul>
            </div>
          </div>
          <div class="column">
            <div class="box">
              <div class="field">
                <label class="label">Motivation</label>
                <div class="columns">
                  <div class="column">
                    <div class="control">
                      <textarea
                        v-debounce
                        v-model.lazy="clss.motivation"
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
              :iri="_iri">

              <p v-show="error">{{ error }}</p>

              <div class="field is-grouped proposal-submit">
                <p class="control">
                  <button
                    class="button is-primary is-medium"
                    @click="sendProposal">
                    Submit Proposal
                  </button>
                </p>
                <p class="control">
                  <button
                    class="button is-medium"
                    @click.prevent="clear">
                    Cancel
                  </button>
                </p>
              </div>

            </new-class-form>

          </div>

        </div>
      </div>

    </section>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import NewClassForm from '@/components/proposal/NewClassForm'
import { SAVE, SUBMIT, NEW, LOAD } from '@/store/action-types'

const {
  mapActions: classActions,
  mapGetters: classGetters
} = createNamespacedHelpers('class')

export default {
  async asyncData ({ query }) {
    const id = parseInt(query.id, 10)
    return {
      id: Number.isNaN(id) ? null : id,
      iri: query.iri || ''
    }
  },
  middleware: 'authenticated',
  components: {
    NewClassForm
  },
  data () {
    return {
      saveTmp: '', // only save if this string changed
      saveInterval: null
    }
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        clearInterval(i)

        this.saveInterval = setInterval(() => {
          if (this.clss['isDraft'] === false) {
            clearInterval(this.saveInterval)
            return
          }
          this.saveDraft()
        }, 2500)
      }
    })
  },
  beforeMount () {
    // if we have an ID from the URL here, we load
    if (this.id) {
      this.load(this.id)
        .then((isDraft) => {
          if (isDraft !== true) {
            this.$router.push({
              name: 'proposal-id',
              params: { id: this.clss['threadId'] }
            })
            return
          }

          if (this.clss['proposalType'] === 'Property') {
            this.$router.push({
              name: 'proposal-new-property',
              query: { id: this.clss['threadId'] }
            })
          }
        })
    } else {
      // otherwise we .clear() which creates a new one
      this.clear()
    }
  },
  beforeDestroy () {
    if (this.saveInterval) {
      this.saveDraft()
      clearInterval(this.saveInterval)
    }
  },
  computed: {
    clss () {
      return this.$deepModel('class.clss')
    },
    _iri () {
      if (this.clss['parentStructureIRI']) {
        return this.clss['parentStructureIRI']
      }
      return this.iri
    },
    progressionSteps () {
      const steps = [
        this.motivationStep(),
        this.detailsStep()
      ]

      // const newSteps = this.newSteps()
      // if (newSteps.length) {
      //   steps.push(...newSteps)
      // }

      const lastStep = {
        check: () => steps.reduce((acc, step, i, col) => {
          if (i !== col.length - 1) {
            return acc && step.check()
          }
          return acc
        }, true),
        html: '<a href="#submit">Finalize and Submit Proposal</a>'
      }
      steps.push(lastStep)
      return steps
    },
    ...classGetters(['success', 'error', 'serialized'])
  },
  watch: {
    success () {
      if (!this.error && this.success) {
        this.$router.push({ name: 'proposal-id', params: { id: this.success } })
      }
    }
  },
  methods: {
    ...classActions({
      clear: NEW,
      submit: SUBMIT,
      save: SAVE,
      load: LOAD
    }),
    sendProposal () {
      // TODO: send a splash screen
      // remove draft status from the json proposalObject
      this.$vuexSet('isDraft', false)
      // save the changes
      this.saveDraft()
        .then(() => {
          const token = this.$apolloHelpers.getToken()
          // create the PR etc
          this.submit(token)
        })
    },
    saveDraft () {
      const serialized = this.serialized
      if (!this.detailsStep().check()) {
        return Promise.resolve()
      }
      if (this.saveTmp !== serialized) {
        this.saveTmp = serialized
        return this.save()
      }
      return Promise.resolve()
    },
    newSteps (steps = [], path = 'propChildren') {
      return this.clss[path].reduce((newSteps, child) => {

      }, steps)
    },
    motivationStep (path = '') {
      return {
        check: () => this.clss[`${path}motivation`],
        text: 'Enter a Motivation'
      }
    },
    detailsStep (path = '') {
      return {
        check: () => this.clss[`${path}label`] && this.clss[`${path}comment`],
        text: 'Enter New Class Details',
        path: 'label'
      }
    }
  },
  validate ({ query }) {
    if (query.iri) return true
    if (query.id) return true
    return false
  }
}
</script>
