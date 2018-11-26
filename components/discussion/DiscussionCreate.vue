<template>
  <div>
    <div class="field">
      <label class="label">IRI</label>
      <div class="control">
        <input
          :value="iri"
          class="input"
          type="text"
          disabled>
      </div>
    </div>

    <div class="field">
      <label class="label">Headline</label>
      <div class="control">
        <input
          v-model="headlineModel"
          class="input"
          type="text"
          placeholder="Thread title">
      </div>
    </div>

    <div class="field">
      <label class="label">Message</label>
      <div class="control">
        <textarea
          v-model="body"
          class="textarea"
          placeholder="Content" />
      </div>
    </div>

    <div class="field is-grouped">
      <div class="control">
        <button
          class="button is-link"
          @click.prevent="create()">Submit</button>
      </div>
      <div class="control">
        <button class="button is-text">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import createDiscussion from '@/apollo/mutations/createDiscussion'
import _get from 'lodash/get'

export default {
  name: 'DiscussionCreate',
  props: {
    iri: {
      required: true,
      type: String,
      validator: (val) => val.length < 280
    },
    headline: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    return {
      headlineModel: this._headline,
      body: ''
    }
  },
  methods: {
    create () {
      const variables = {
        headline: this.headlineModel,
        iri: this.iri,
        body: this.body,
        threadType: 'DISCUSSION'
      }

      this.$apollo.mutate({ mutation: createDiscussion, variables })
        .then((result) => {
          const id = _get(result, 'data.createThread.thread.id')
          if (id) {
            this.$router.push({ name: 'discussion-id', params: { id } })
          }
          else {
            console.error('Failed to redirect', result)
          }
        })
        .catch((err) => {
          console.error(err)
          this.$sentry.captureException(err)
        })
    }
  }
}
</script>
