<template>
  <div>
    <div
      v-if="_get($auth, '$state.loggedIn', false)"
      class="media reply-box">
      <figure class="media-left">
        <p
          v-if="_get($store, 'state.auth.user.avatar_url', false)"
          class="image is-48x48">
          <img
            class="is-rounded"
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
        <div class="opposite-fields">
          <div
            v-show="$store.state.auth.hats && $store.state.auth.hats.length"
            class="field top">
            <div class="control is-expanded">
              <div class="select is-fullwidth">
                <select
                  v-model="selectedHat">
                  <option value="">
                    Answer as…
                  </option>
                  <option
                    v-for="hat in $store.state.auth.hats"
                    :key="hat.id"
                    :value="hat.id">
                    {{ hat.title }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="field bottom">
            <div class="control">
              <button
                class="button is-link is-fullwidth"
                @click.prevent="create()">
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else />
  </div>
</template>

<script>
import _get from 'lodash/get'
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
      selectedHat: ''
    }
  },
  methods: {
    _get,
    create () {
      const variables = {
        threadId: this.id,
        body: this.body
      }
      if (this.selectedHat) {
        variables.hatId = this.selectedHat
      }

      this.$apollo.mutate({ mutation: answerDiscussion, variables })
        .then((data) => {
          this.$emit('answerAdded')
          this.body = ''
          this.selectedHat = ''
        })
        .catch((err) => {
          console.error(err)
          this.$sentry.captureException(err)
        })
    }
  }
}
</script>
