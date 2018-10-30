<template>
  <div>
    <section class="section">

      <div class="container">

        <h1 class="title">
          New Class Request<span
            v-show="clss.label">:
            "{{ clss.label }}"
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
          :iri="iri">

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

    </section>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import { datasetsSetup } from '@/libs/utils'
import NewClassForm from '@/components/NewClassForm'
import { SUBMIT, NEW } from '@/store/action-types'

const {
  mapActions: classActions,
  mapGetters: classGetters
} = createNamespacedHelpers('class')

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
  beforeMount () {
    this.clear()
  },
  computed: {
    clss () {
      return this.$deepModel('class.clss')
    },
    ...classGetters(['success', 'error'])
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
      submit: SUBMIT
    }),
    sendProposal () {
      const token = this.$apolloHelpers.getToken()
      this.submit(token)
    }
  },
  validate ({ query }) {
    return !!query.iri
  }
}
</script>
