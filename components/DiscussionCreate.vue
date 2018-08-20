<template>
  <div>
    <div class="field">
      <label class="label">IRI</label>
      <div class="control">
        <input
          :value="_iri"
          class="input"
          type="text"
          disabled>
      </div>
    </div>

    <div class="field">
      <label class="label">Headline</label>
      <div class="control">
        <input
          v-model="headline"
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
          placeholder="Content"/>
      </div>
    </div>

    <div class="field is-grouped">
      <div class="control">
        <button
          class="button is-link"
          @click="create()">Submit</button>
      </div>
      <div class="control">
        <button class="button is-text">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import _get from 'lodash/get'

export default {
  name: 'DiscussionCreate',
  props: {
    _iri: {
      required: true,
      type: String,
      validator: (val) => val.length < 280
    },
    _headline: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    return {
      headline: this._headline,
      body: ''
    }
  },
  methods: {
    create () {
      const mutation = gql`
        mutation ($headline: String!, $body: String!, $iri: String!) {
          createThread (input: {
            thread: {
              headline: $headline,
              body: $body,
              iri: $iri
            }
          }) {
            thread {
              id
            }
          }
        }
      `

      const variables = {
        headline: this.headline,
        iri: this._iri,
        body: this.body
      }

      this.$apollo.mutate({mutation, variables})
        .then((data) => {
          const id = _get(data, 'createThread.thread.id')
          if (id) {
            this.$router.push({ name: 'discussion', query: { id } })
          }
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }
}
</script>
