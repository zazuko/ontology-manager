<template>
  <div>
    <section class="section">

      <div class="container">

        <h1 class="title">
          Property Request<span
            v-show="name">:
            "{{ name }}"
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
                    v-model="motivation"
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

          <div class="field is-grouped">
            <p class="control">
              <button
                class="button is-primary"
                @click="submit">
                Submit Proposal
              </button>
            </p>
            <p class="control">
              <button class="button">
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
import { createHelpers } from 'vuex-map-fields'

import { datasetsSetup } from '@/libs/utils'
import NewPropertyForm from '@/components/NewPropertyForm'
import { NEW, SUBMIT } from '@/store/action-types'

const {
  mapActions: mapPropertyActions
} = createNamespacedHelpers('property')

const { mapFields: mapPropertyFields } = createHelpers({
  getterType: 'property/getField',
  mutationType: 'property/updateField'
})

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
    await this.new()
    await datasetsSetup(this.$store)
  },
  computed: {
    ...mapPropertyFields(['property.name', 'property.motivation']),
  },
  methods: {
    ...mapPropertyActions({
      new: NEW,
      submit: SUBMIT
    })
  },
  validate ({ query }) {
    return !!query.iri
  }
}
</script>
