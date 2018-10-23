<template>
  <div>
    <section class="section">

      <div class="container">

        <h1 class="title">
          Property Request<span
            v-show="prop.name">:
            "{{ prop.name }}"
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
                    v-model="prop.motivation"
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
          :iri="iri">

          <p v-show="error">{{ error }}</p>

          <div class="field is-grouped">
            <p class="control">
              <button
                class="button is-primary"
                @click.prevent="sendProposal">
                Submit Proposal
              </button>
            </p>
            <p class="control">
              <button
                class="button"
                @click.prevent="clear">
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
import { createNamespacedHelpers } from 'vuex'

import { datasetsSetup } from '@/libs/utils'
import NewPropertyForm from '@/components/NewPropertyForm'
import { SUBMIT, NEW } from '@/store/action-types'

const {
  mapActions: propertyActions,
  mapGetters: propertyGetters
} = createNamespacedHelpers('prop')

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
  computed: {
    prop () {
      return this.$deepModel('prop.prop')
    },
    ...propertyGetters(['success', 'error'])
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
