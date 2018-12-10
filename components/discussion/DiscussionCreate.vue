<template>
  <div>
    <div class="level">
      <div class="level-left">
        <h1 class="title is-1">New Thread</h1>
      </div>
      <div class="level-right">
        <button
          class="button"
          @click.prevent="cancel()">
          Cancel
        </button>
      </div>
    </div>
    <div class="discussion">
      <div class="discussion-form media">
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
              <input
                v-model="headlineModel"
                class="input"
                type="text"
                placeholder="Topic title">
            </div>
          </div>
          <div class="field">
            <div class="control">
              <textarea
                v-model="body"
                class="textarea"
                placeholder="What's on your mind" />
            </div>
          </div>
        </div>

        <div class="media-right">
          <div class="field discussion-post-button">
            <div class="control">
              <button
                class="button is-info"
                @click.prevent="create()">
                Comment
              </button>
            </div>
          </div>
        </div>
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
    _get,
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
    },
    cancel () {
      this.headlineModel = ''
      this.body = ''
      this.$router.go(-1)
    }
  }
}
</script>
