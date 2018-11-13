<template>
  <div>
    <section class="section">

      <div class="container">
        <div class="columns">
          <div class="column is-3" />
          <div class="column">
            <h1 class="title">
              Property Request<span
                v-show="prop.name">:
                "{{ prop.name }}"
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
          <div
            sticky-container
            class="column is-3">
            <progression-box
              proposal-path="prop.prop"
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

            <new-property-form
              :disabled="disabled"
              :iri="_iri">

              <p v-show="error">{{ error }}</p>

              <div
                v-show="!disabled"
                class="field is-grouped proposal-submit">
                <p class="control">
                  <button
                    id="submit"
                    class="button is-primary is-medium"
                    :disabled="!isReady"
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
            </new-property-form>
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

import NewPropertyForm from '@/components/proposal/NewPropertyForm'
import ProgressionBox from '@/components/proposal/ProgressionBox'
import { SAVE, SUBMIT, NEW, LOAD } from '@/store/action-types'

const {
  mapActions: propertyActions,
  mapGetters: propertyGetters
} = createNamespacedHelpers('prop')

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
    NewPropertyForm,
    ProgressionBox
  },
  data () {
    return {
      saveTmp: '', // only save if this string changed
      saveInterval: null,
      disabled: false,
      isLoading: false,
      isReady: true
    }
  },
  mounted () {
    let i = setInterval(() => {
      if (typeof window !== 'undefined') {
        clearInterval(i)

        this.saveInterval = setInterval(() => {
          if (this.prop['isDraft'] === false) {
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
            this.disabled = true
            return
          }

          if (this.prop['proposalType'] === 'Class') {
            this.$router.push({
              name: 'proposal-new-class',
              query: { id: this.prop['threadId'] }
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
      this.$vuexSet('isDraft', false)
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
      this.isReady = flag
    }
  },
  validate ({ query }) {
    if (query.iri) return true
    if (query.id) return true
    return false
  }
}
</script>
