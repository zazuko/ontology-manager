<template>
  <div>
    <div class="container layout-proposal">
      <section
        v-show="storeReady">
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

              <p v-show="error">{{ error }}</p>

              <div
                v-show="!disabled"
                class="columns proposal-submit">
                <p class="column is-6">
                  <button
                    id="submit"
                    class="button is-info"
                    :disabled="!proposalReady"
                    @click.prevent="sendProposal">
                    Submit Proposal
                  </button>
                </p>
                <p class="column is-6">
                  <button
                    class="button is-dark-info"
                    @click.prevent="clear">
                    Cancel
                  </button>
                </p>
              </div>

            </class-form>

          </div>

        </div>
      </section>
      <div
        v-show="!storeReady"
        class="modal is-active">
        <div class="modal-background" />
        <div class="modal-content has-text-centered">
          <div class="box">
            <div class="lds-roller"><div /><div /><div /><div /><div /><div /><div /><div /></div>
            <p class="subtitle">Loading Data</p>
          </div>
        </div>
      </div>

      <div
        :class="{ 'is-active': isLoading }"
        class="modal">
        <div class="modal-background" />
        <div class="modal-content has-text-centered">
          <div class="box">
            <div class="lds-roller"><div /><div /><div /><div /><div /><div /><div /><div /></div>
            <p class="subtitle">Generating Proposal</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import ClassForm from '@/components/proposal/ClassForm'
import ProgressionBox from '@/components/proposal/ProgressionBox'
import { SAVE, SUBMIT, NEW, LOAD } from '@/store/action-types'
import { hydrate } from '@/models/Class'
import { headTitle } from '@/libs/utils'

const {
  mapActions: classActions,
  mapGetters: classGetters
} = createNamespacedHelpers('class')

export default {
  async asyncData ({ query }) {
    const id = parseInt(query.id, 10)
    return {
      id: Number.isNaN(id) ? null : id,
      iri: query.iri || '',
      edit: Boolean(query.edit)
    }
  },
  middleware: 'authenticated',
  components: {
    ClassForm,
    ProgressionBox
  },
  data () {
    return {
      saveTmp: '', // only save if this string changed
      saveInterval: null,
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
        if (this.clss['isDraft'] === false) {
          clearInterval(this.saveInterval)
          return
        }
        this.saveDraft()
      }, 2500)
    }
  },
  beforeMount () {
    // if we are editing an existing class, we populate the form with ontology data
    if (this.edit) {
      const ontology = this.$store.state.graph.ontology
      const structure = this.$store.state.graph.structure
      const clss = hydrate({ ontology, structure }, this.iri)
      this.$store.commit('class/LOAD', clss)
      this.storeReady = true
    }
    // if we have an ID from the URL here, we load
    else if (this.id) {
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
    }
    else {
      // otherwise we .clear() which creates a new one
      this.clear()
      this.storeReady = true
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
    ...classGetters(['success', 'error', 'serialized'])
  },
  watch: {
    success () {
      if (!this.error && this.success) {
        this.$store.dispatch('drafts/LOAD')
        this.$router.push({ name: 'proposal-id', params: { id: this.success } })
      }
      else {
        console.error(this.error)
        console.log(this.success)
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
      await this.saveDraft()

      const token = this.$apolloHelpers.getToken()
      // create the PR etc
      await this.submit(token)
      // submit will commit success or error to the store,
      // see this page's `watch`ers
    },
    saveDraft () {
      const serialized = this.serialized
      if (!this.clss.label && !this.clss.comment) {
        return Promise.resolve()
      }
      if (this.saveTmp !== serialized) {
        this.saveTmp = serialized
        this.$store.dispatch('drafts/LOAD')
        return this.save()
      }
      return Promise.resolve()
    },
    finalize (flag) {
      this.proposalReady = flag
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
    if (this.obj) {
      if (this.obj.label) {
        h.title += headTitle(` '${this.obj.label}'`)
      }
      if (this.comment) {
        h.meta = [
          { hid: 'description', name: 'description', content: `Proposal '${this.obj.label}' on '${this.obj.parentStructureIRI}'` }
        ]
      }
    }
    return h
  }
}
</script>
