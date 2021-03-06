<template>
  <div>
    <div class="container layout-proposal">
      <section v-show="storeReady">
        <div class="columns">
          <div class="column is-3 layout-proposal-sidebar-gap" />

          <div class="column layout-proposal-header">
            <h1 class="title is-1">
              {{ edit ? 'Request Changes on Property' : 'Request New Property' }}<span
                v-show="prop.label">:
                "{{ prop.label }}"
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
          <div class="column is-3 sticky-container">
            <progression-box
              proposal-path="prop.prop"
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
                        class="textarea"
                        :readonly="readonly"
                        :class="{'is-danger': !prop.motivation}"
                        v-debounce
                        v-model.lazy="prop.motivation"
                        placeholder="" />
                    </div>
                    <p
                      v-show="!prop.motivation"
                      class="help is-danger">
                      Please explain the need for this proposal.
                    </p>
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

            <property-form
              :readonly="readonly"
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
                v-show="!readonly"
                class="columns proposal-submit">
                <p
                  v-show="proposalReady"
                  class="column">
                  <button
                    id="submit"
                    class="button submit-proposal"
                    @click.prevent="sendProposal">
                    Submit Proposal
                  </button>
                </p>
                <p class="column">
                  <a
                    v-show="savingIndicator === 'spinning'"
                    class="button save-proposal is-loading">
                    Loading
                  </a>
                  <button
                    v-show="savingIndicator !== 'spinning'"
                    class="button save-proposal"
                    @click.prevent="saveDraft">
                    <span v-show="savingIndicator === 'done'">
                      Draft Saved <check />
                    </span>
                    <span v-show="savingIndicator !== 'done'">
                      Save Draft
                    </span>
                  </button>
                </p>
                <p class="column">
                  <button
                    class="button discard-proposal"
                    @click.prevent="discard">
                    Discard Draft
                  </button>
                </p>
              </div>

            </property-form>

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
import PropertyForm from '@/components/proposal/PropertyForm'
import ProgressionBox from '@/components/proposal/ProgressionBox'
import Loader from '@/components/layout/Loader'
import { toastClose } from '@/libs/utils'
import Check from 'vue-material-design-icons/Check.vue'

import { SAVE, SUBMIT, NEW, LOAD } from '@/store/action-types'

const {
  mapActions: propertyActions,
  mapGetters: propertyGetters
} = createNamespacedHelpers('prop')

export default {
  layout: 'default',
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
    PropertyForm,
    ProgressionBox,
    Loader,
    Check
  },
  data () {
    return {
      saveTmp: '', // only save if this string changed
      saveInterval: null,
      savingIndicator: false,
      readonly: false,
      isLoading: false,
      proposalReady: true,
      storeReady: false
    }
  },
  mounted () {
    if (process.browser) {
      this.saveInterval = setInterval(() => {
        if ((this.prop && this.prop.isDraft === false) || this.readonly) {
          this.stopAutosave()
          return
        }
        this.autosaveDraft()
      }, 2500)
    }
  },
  beforeMount () {
    // if we are editing an existing property, we populate the form with ontology data
    if (this.edit) {
      const ontology = this.$store.state.graph.ontology
      const structure = this.$store.state.graph.structure
      const prop = this.$Property.hydrate({ ontology, structure }, this.iri)
      this.$store.commit('prop/LOAD', prop)
      this.storeReady = true
    }
    // if we have an ID from the URL here, we load
    else if (this.isEditingExistingDraft) {
      this.waitForAuth = setInterval(() => {
        if (!this.$store.state.authProcessDone || typeof this.prop === 'undefined') {
          return
        }
        clearInterval(this.waitForAuth)
        this.load(this.id)
          .then((isDraft) => {
            this.storeReady = true
            this.edit = this.prop.isEdit
            if (isDraft !== true) {
              this.readonly = true
              return
            }

            if (this.prop.proposalType === 'Class') {
              this.$router.push({
                name: 'zom-proposal-class',
                query: { id: this.prop.threadId }
              })
            }
          })
          .catch(() => {
            return this.$router.app.error({
              statusCode: 404,
              message: 'Not found'
            })
          })
      }, 200)
    }
    else {
      // otherwise we .clear() which creates a new one
      this.clear()
      this.storeReady = true
    }
  },
  async beforeDestroy () {
    clearInterval(this.waitForAuth)
    if (this.saveInterval) {
      await this.saveDraft()
      this.stopAutosave()
    }
  },
  computed: {
    prop () {
      if (process.server) {
        return this.$store.state.prop.prop
      }
      return this.$deepModel('prop.prop')
    },
    _iri () {
      if (this.prop.parentStructureIRI) {
        return this.prop.parentStructureIRI
      }
      return this.iri
    },
    serialized () {
      return this.$proposalSerializer(this.prop)
    },
    ...propertyGetters(['success', 'error'])
  },
  watch: {
    id () {
      if (typeof this.id === 'number') {
        this.$router.push({
          name: 'zom-proposal-property',
          query: { id: this.id }
        })
      }
    },
    success () {
      if (!this.error && this.success) {
        this.$store.dispatch('drafts/LOAD')
        this.$router.push({ name: 'zom-proposal-id', params: { id: this.success } })
      }
    },
    error () {
      if (this.error && !this.success) {
        this.$vuexSet('prop.prop.isDraft', true)
        this.autosaveDraft().then(() => {
          this.isLoading = false
          this.$toast.error(`Error: ${this.error}`, toastClose)
        })
      }
    }
  },
  methods: {
    ...propertyActions({
      clear: NEW,
      submit: SUBMIT,
      save: SAVE,
      load: LOAD
    }),
    async sendProposal () {
      // Send splash screen
      this.isLoading = true
      // remove draft status from the json proposalObject
      this.$vuexSet('prop.prop.isDraft', false)
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
    async cancel () {
      await this.clear()
      this.$router.push({ path: '/' })
    },
    async autosaveDraft () {
      const serialized = this.serialized
      if (this.prop.label && this.prop.comment && this.saveTmp !== serialized) {
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
      if (!this.prop.label && !this.prop.comment) {
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
    if (!this.readonly) {
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
