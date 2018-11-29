<template>
  <div>
    <section class="section">

      <div
        v-show="storeReady"
        class="container">
        <div class="columns">
          <div class="column is-3" />
          <div class="column">
            <h1 class="title">
              {{ edit ? 'Request Changes on Property' : 'Request New Property' }}<span
                v-show="prop.label">:
              "{{ prop.label }}"
              </span>
            </h1>
            <h2 class="subtitle">
              On <code>{{ _iri }}</code>
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
                        :disabled="disabled"
                        v-debounce
                        v-model.lazy="prop.motivation"
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

            <property-form
              :disabled="disabled"
              :edit="edit"
              :iri="_iri">

              <p v-show="error">{{ error }}</p>

              <div
                v-show="!disabled"
                class="field is-grouped proposal-submit">
                <p class="control">
                  <button
                    id="submit"
                    class="button is-link is-medium"
                    :disabled="!proposalReady"
                    @click.prevent="sendProposal">
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

            </property-form>

          </div>

        </div>
      </div>
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

    </section>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import PropertyForm from '@/components/proposal/PropertyForm'
import ProgressionBox from '@/components/proposal/ProgressionBox'
import { SAVE, SUBMIT, NEW, LOAD } from '@/store/action-types'
import { hydrate } from '@/models/Property'

const {
  mapActions: propertyActions,
  mapGetters: propertyGetters
} = createNamespacedHelpers('prop')

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
    PropertyForm,
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
      this.saveInterval = setInterval(() => {
        if (this.prop && this.prop['isDraft'] === false) {
          clearInterval(this.saveInterval)
          return
        }
        this.saveDraft()
      }, 2500)
    }

    this.edit = this.edit || this.prop.isEdit
  },
  beforeMount () {
    // if we are editing an existing property, we populate the form with ontology data
    if (this.edit) {
      const ontology = this.$store.state.graph.ontology
      const structure = this.$store.state.graph.structure
      const prop = hydrate({ ontology, structure }, this.iri)
      this.$store.commit('prop/LOAD', prop)
      this.storeReady = true
    }
    // if we have an ID from the URL here, we load
    else if (this.id) {
      this.load(this.id)
        .then((isDraft) => {
          this.storeReady = true
          if (isDraft !== true) {
            this.disabled = true
            return
          }

          if (this.prop['proposalType'] === 'Class') {
            this.$router.push({
              name: 'proposal-class',
              query: { id: this.prop['threadId'] }
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
    prop () {
      if (process.server) {
        return this.$store.state.prop.prop
      }
      return this.$deepModel('prop.prop')
    },
    _iri () {
      if (this.prop['parentStructureIRI']) {
        return this.prop['parentStructureIRI']
      }
      return this.iri
    },
    ...propertyGetters(['success', 'error', 'serialized'])
  },
  watch: {
    success () {
      if (!this.error && this.success) {
        this.$store.dispatch('drafts/LOAD')
        this.$router.push({ name: 'proposal-id', params: { id: this.success } })
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
      await this.saveDraft()

      const token = this.$apolloHelpers.getToken()
      // create the PR etc
      this.submit(token)
    },
    saveDraft () {
      const serialized = this.serialized
      if (!this.prop.label && !this.prop.comment) {
        return Promise.resolve()
      }
      if (this.saveTmp !== serialized) {
        this.saveTmp = serialized
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
  }
}
</script>
