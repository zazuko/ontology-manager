<template>
  <div>
    <div
      v-if="_get($auth, '$state.loggedIn', false)"
      class="media discussion-form">
      <figure class="media-left">
        <p v-if="_get($store, 'state.auth.user.avatar_url', false)">
          <img
            class="discussion-avatar"
            :src="_get($store, 'state.auth.user.avatar_url', '')">
        </p>
        <p v-else />
      </figure>
      <div class="media-content">
        <div class="field">
          <div class="control">
            <editor v-model="body" />
          </div>
        </div>
      </div>
      <div class="media-right">
        <div
          v-show="_get($store, 'state.auth.hats.length', 0)"
          class="field top">
          <div class="control is-expanded">
            <div class="select is-fullwidth">
              <select
                v-model="selectedHat">
                <option value="">
                  Answer as…
                </option>
                <option
                  v-for="hat in _get($store, 'state.auth.hats', [])"
                  :key="hat.id"
                  :value="hat.id">
                  {{ hat.title }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="field discussion-post-button">
          <div class="control">
            <button
              class="button is-info"
              :disabled="!body"
              @click.prevent="create()">
              Comment
            </button>
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
import Editor from '@/components/editor/Editor'

export default {
  name: 'DiscussionReply',
  props: {
    id: {
      required: true,
      type: Number
    }
  },
  components: {
    Editor
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
          this.$emit('answerAdded', 'Answer successfully added!')
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
