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
          <div
            sticky-container
            class="column is-3">
            <progression-box proposal-path="class.clss" />
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
                    id="submit"
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

import NewClassForm from '@/components/proposal/NewClassForm'
import ProgressionBox from '@/components/proposal/ProgressionBox'
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
    NewClassForm,
    ProgressionBox
  },
  data () {
    return {
      saveTmp: '', // only save if this string changed
      saveInterval: null,
      isLoading: false
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
            // TODO should we disable edition here?
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
      // Send splash screen
      this.isLoading = true
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
      if (!this.clss.label && !this.clss.comment) {
        return Promise.resolve()
      }
      if (this.saveTmp !== serialized) {
        this.saveTmp = serialized
        return this.save()
      }
      return Promise.resolve()
    }
  },
  validate ({ query }) {
    if (query.iri) return true
    if (query.id) return true
    return false
  }
}
</script>
