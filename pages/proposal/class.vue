<template>
  <div>
    <div class="container layout-proposal">
      <section v-show="storeReady">
        <div class="columns">
          <div class="column is-3" />

          <div class="column">
            <h1 class="title is-1">
              {{ edit ? 'Request Changes on Class' : 'Request New Class' }}<span
                v-show="clss.label">:
                "{{ clss.label }}"
              </span>
            </h1>

            <h2 class="subtitle is-1">
              On <span class="title-url">{{ _iri }}</span>
            </h2>

            <p v-show="edit">
              This form allows suggesting modifications to the ontology.
            </p>
            <p v-show="!edit">
              This form allows suggesting new elements to include in the ontology.
            </p>
            <p>
              Once submitted, the proposal will be discussed and eventually accepted or rejected by official team members.
            </p>
          </div>
        </div>

        <div class="columns">
          <div
            sticky-container
            class="column is-3">
            <progression-box
              proposal-path="class.clss"
              :edit="edit"
              @step-done="finalize" />
          </div>

          <div class="column">
            <div class="box">
              <div
                id="motivation"
                class="field">
                <label class="label">Motivation</label>
                <div class="columns">
                  <div class="column">
                    <div class="control">
                      <textarea
                        :disabled="disabled"
                        v-debounce
                        v-model.lazy="clss.motivation"
                        class="textarea"
                        placeholder="" />
                    </div>
                  </div>
                  <div class="column">
                    <p class="desc">
                      In your motivation, please mention involved parties and other supportive
                      entities, what shortcoming this proposal is expected to overcome
                      or what purpose it serves.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <class-form
              :disabled="disabled"
              :edit="edit"
              :iri="_iri">

              <div
                v-show="error"
                class="modal is-active">
                <div class="modal-background" />
                <div class="modal-content has-text-centered">
                  <div class="box">
                    <p class="subtitle">
                      {{ error }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-show="!disabled"
                class="columns proposal-submit">
                <p
                  v-show="proposalReady"
                  class="column">
                  <button
                    id="submit"
                    class="submit-proposal"
                    @click.prevent="sendProposal">
                    Submit Proposal
                  </button>
                </p>
                <p class="column">
                  <a
                    v-show="savingIndicator === 'spinning'"
                    class="save-proposal is-loading">
                    Loading
                  </a>
                  <button
                    v-show="savingIndicator !== 'spinning'"
                    class="save-proposal"
                    @click.prevent="saveDraft">
                    <span v-show="savingIndicator === 'done'">
                      Draft Saved <i class="mdi mdi-check"></i>
                    </span>
                    <span v-show="savingIndicator !== 'done'">
                      Save Draft
                    </span>
                  </button>
                </p>
                <p class="column">
                  <button
                    class="discard-proposal"
                    @click.prevent="discard">
                    Discard Draft
                  </button>
                </p>
              </div>

            </class-form>

          </div>

        </div>
      </section>

      <loader :show-if="!storeReady" />
      <loader :show-if="isLoading">
        <p class="subtitle">Generating Proposal</p>
      </loader>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import discardDraft from '@/apollo/mutations/discardDraft'
import ClassForm from '@/components/proposal/ClassForm'
import ProgressionBox from '@/components/proposal/ProgressionBox'
import Loader from '@/components/layout/Loader'
import { toastClose } from '@/libs/utils'

import { SAVE, SUBMIT, NEW, LOAD } from '@/store/action-types'

const {
  mapActions: classActions,
  mapGetters: classGetters
} = createNamespacedHelpers('class')

export default {
  async asyncData ({ query }) {
    let id = parseInt(query.id, 10)
    id = Number.isNaN(id) ? null : id
    return {
      id,
      isEditingExistingDraft: !!id,
      iri: query.iri || '',
      edit: Boolean(query.edit) // it's a change proposal, not a new thing proposal
    }
  },
  middleware: 'authenticated',
  components: {
    ClassForm,
    ProgressionBox,
    Loader
  },
  data () {
    return {
      saveTmp: '', // only save if this string changed
      saveInterval: null,
      savingIndicator: false,
      disabled: false,
      isLoading: false,
      proposalReady: true,
      storeReady: false
    }
  },
  mounted () {
    if (process.browser) {
      // save draft at fixed time interval
      this.saveInterval = setInterval(() => {
        if ((this.clss && this.clss['isDraft'] === false) || this.disabled) {
          this.stopAutosave()
          return
        }
        this.autosaveDraft()
      }, 2500)
    }
  },
  beforeMount () {
    // if we are editing an existing class, we populate the form with ontology data
    if (this.edit) {
      const ontology = this.$store.state.graph.ontology
      const structure = this.$store.state.graph.structure
      const clss = this.$Class.hydrate({ ontology, structure }, this.iri)
      this.$store.commit('class/LOAD', clss)
      this.storeReady = true
    }
    // if we have an ID from the URL here, we load
    else if (this.isEditingExistingDraft) {
      const waitForAuth = setInterval(() => {
        if (!this.$store.state.authProcessDone || typeof this.clss === 'undefined') {
          return
        }
        clearInterval(waitForAuth)
        this.load(this.id)
          .then((isDraft) => {
            this.storeReady = true
            this.edit = this.clss.isEdit
            if (isDraft !== true) {
              this.disabled = true
              return
            }

            if (this.clss['proposalType'] === 'Property') {
              this.$router.push({
                name: 'proposal-property',
                query: { id: this.clss['threadId'] }
              })
            }
          })
      }, 200)
    }
    else {
      // otherwise we .clear() which creates a new one
      this.clear()
      this.storeReady = true
    }
  },
  beforeDestroy () {
    if (this.saveInterval) {
      this.autosaveDraft()
      this.stopAutosave()
    }
  },
  computed: {
    clss () {
      if (process.server) {
        return this.$store.state.class.clss
      }
      return this.$deepModel('class.clss')
    },
    _iri () {
      if (this.clss['parentStructureIRI']) {
        return this.clss['parentStructureIRI']
      }
      return this.iri
    },
    serialized () {
      return this.$proposalSerializer(this.clss)
    },
    ...classGetters(['success', 'error'])
  },
  watch: {
    success () {
      if (!this.error && this.success) {
        this.$store.dispatch('drafts/LOAD')
        this.$router.push({ name: 'proposal-id', params: { id: this.success } })
      }
    },
    error () {
      if (this.error && !this.success) {
        this.$vuexSet('class.clss.isDraft', true)
        this.autosaveDraft().then(() => {
          this.isLoading = false
          this.$toast.error(`Error: ${this.error}`, toastClose)
        })
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
    async sendProposal () {
      // Send splash screen
      this.isLoading = true
      // remove draft status from the json proposalObject
      this.$vuexSet('class.clss.isDraft', false)
      // save the changes
      await this.autosaveDraft()
      this.stopAutosave()

      const token = this.$apolloHelpers.getToken()
      // create the PR etc
      await this.submit(token)
      // submit will commit success or error to the store,
      // see this page's `watch`ers
    },
    stopAutosave () {
      clearInterval(this.saveInterval)
      this.saveInterval = null
    },
    async autosaveDraft () {
      const serialized = this.serialized
      if (this.clss.label && this.clss.comment && this.saveTmp !== serialized) {
        this.saveTmp = serialized
        this.$store.dispatch('drafts/LOAD')
        this.id = await this.save()
      }
    },
    async saveDraft () {
      if (this.savingIndicator === 'spinning') {
        return
      }
      this.savingIndicator = 'spinning'
      const serialized = this.serialized
      if (!this.clss.label && !this.clss.comment) {
        // console.log('not saved: no label or no comment')
      }
      if (this.saveTmp !== serialized) {
        this.saveTmp = serialized
        this.$store.dispatch('drafts/LOAD')
        this.id = await this.save()
      }
      setTimeout(() => {
        this.savingIndicator = 'done'
      }, 300)
      if (this.savingIndicatorTimeout) {
        clearTimeout(this.savingIndicatorTimeout)
      }
      this.savingIndicatorTimeout = setTimeout(() => {
        this.savingIndicator = false
      }, 5 * 1000)
    },
    finalize (flag) {
      this.proposalReady = flag
    },
    async discard () {
      this.stopAutosave()
      if (typeof this.id === 'number') {
        const variables = { threadId: this.id }
        try {
          await this.$apollo.mutate({ mutation: discardDraft, variables })
          this.$emit('discarded', this.id)
          this.$router.push({ path: '/' })
        }
        catch (err) {
          console.error(err)
          this.$sentry.captureException(err)
        }
      }
    }
  },
  validate ({ query }) {
    if (query.iri) {
      return true
    }
    if (query.id) {
      return true
    }
    return false
  },
  head () {
    const h = {
      title: 'Proposal'
    }

    if (this.obj && this.obj.label) {
      h.title += this.$headTitle(` '${this.obj.label}'`)
    }
    if (this.obj) {
      h.meta = [
        { hid: 'description', name: 'description', content: `Proposal '${this.obj.label}' on '${this.obj.parentStructureIRI}'` }
      ]
    }
    if (!this.disabled) {
      h.link = [{
        rel: 'stylesheet',
        href: '/yate.min.css'
      }]
      h.script = [{
        src: '/yate.bundled.min.js'
      }]
    }

    return h
  }
}
</script>
