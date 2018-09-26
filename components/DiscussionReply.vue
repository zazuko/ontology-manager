<template>
  <div>
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
// import _get from 'lodash/get'

export default {
  name: 'DiscussionReply',
  props: {
    id: {
      required: true,
      type: Number
    }
  },
  data () {
    return {
      body: '',
      hatId: null
    }
  },
  methods: {
    create () {
      const mutation = gql`
        mutation ($threadId: Int!, $body: String!, $hatId: Int) {
          createMessage (input: {
            message: {
              threadId: $threadId,
              body: $body,
              hatId: $hatId
            }
          }) {
            message {
              id
            }
          }
        }
      `

      const variables = {
        threadId: this.id,
        body: this.body,
        hatId: this.hatId
      }

      this.$apollo.mutate({ mutation, variables })
        .then((data) => {
          this.$emit('answerAdded')
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }
}
</script>
