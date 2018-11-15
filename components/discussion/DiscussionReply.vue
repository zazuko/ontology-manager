<template>
  <div>
    <div class="media reply-box">
      <figure class="media-left">
        <p
          v-if="$store.state.auth.user.avatar_url"
          class="image is-48x48">
          <img
            :src="$store.state.auth.user.avatar_url">
        </p>
        <p v-else />
      </figure>
      <div class="media-content">
        <div class="field">
          <div class="control">
            <textarea
              v-model="body"
              class="textarea"
              placeholder="Content" />
          </div>
        </div>
      </div>
      <div class="media-right">
        <button
          class="button is-link"
          @click="create()">Comment</button>
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
          this.body = ''
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }
}
</script>
