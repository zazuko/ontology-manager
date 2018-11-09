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
import answerDiscussion from '@/apollo/mutations/answerDiscussion'

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
      const variables = {
        threadId: this.id,
        body: this.body,
        hatId: this.hatId
      }

      this.$apollo.mutate({ mutation: answerDiscussion, variables })
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
