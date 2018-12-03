<template>
  <div>
    <div class="level">
      <div class="level-left">
        <h2 class="title is-4">
          {{ headline }}
        </h2>
      </div>

      <div
        v-show="canEdit(discussion.author.id)"
        class="level-right discussion-action">
        <img
          src="~/assets/images/ic-edit-passive.svg"
          alt="Edit discussion"
          title="Edit discussion"
          @click="editThread = !editThread">
        <img
          src="~/assets/images/ic-trashcan-passive.svg"
          alt="Delete discussion"
          title="Delete discussion">
      </div>
    </div>
    <section>
      <div
        v-show="!editThread"
        class="media topic-box">
        <figure class="media-left">
          <p class="image is-48x48">
            <img
              class="is-rounded"
              :src="discussion.author.avatar"
              :alt="authorsAvatar(discussion.author.name)">
          </p>
        </figure>
        <div class="media-content">
          <p class="content">
            {{ discussion.body }}
          </p>
        </div>
      </div>
      <div
        v-show="editThread"
        class="media discussion-box">
        <figure class="media-left">
          <p class="image is-48x48">
            <img
              class="is-rounded"
              :src="discussion.author.avatar"
              :alt="authorsAvatar(discussion.author.name)">
          </p>
        </figure>
        <div class="media-content">
          <div class="field">
            <div class="control">
              <input
                v-model="headline"
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
                placeholder="Content" />
            </div>
          </div>
        </div>

        <div class="media-right">
          <div class="opposite-fields">
            <div class="field top">
              <div class="control is-expanded has-text-right">
                <span
                  class="delete"
                  @click="editThread = false"/>
              </div>
            </div>
            <div class="field bottom">
              <div class="control">
                <button
                  class="button is-link is-fullwidth"
                  @click.prevent="saveTopic()">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="topic-info level">
        <div class="level-left">
          <span class="creation-info">
            Created on {{ formatDate(discussion.createdAt) }} by
          </span>
          <span class="author-info">
            &nbsp;{{ discussion.author.name }}
          </span>
        </div>
        <div class="level-right">
          <span class="answers-count">
            <span class="icon is-small">
              <i class="mdi mdi-message-reply-text" />
            </span>
            {{ messages.length }}
          </span>
        </div>
      </div>
    </section>

    <div v-if="messages.length">
      <hr v-show="messages.length" />
      <section
        v-for="message in messages"
        :key="message.id"
        class="media answer-box">
        <figure class="media-left">
          <p class="image is-48x48">
            <img
              class="is-rounded"
              :src="message.author.avatar"
              :alt="authorsAvatar(message.author.name)">
          </p>
        </figure>
        <div class="media-content">
          <div class="answer-info">
            <span
              class="author-info">
              {{ message.author.name }}
            </span>
            <span class="creation-info">
              commented on {{ message.createdAt | formatDate }}
            </span>
          </div>
          <div class="answer-content">
            <p class="content">
              {{ message.body }}
            </p>
          </div>
          <div
            v-show="message.hat"
            class="answer-hat">
            {{ _get(message, 'hat.title', '') }}
          </div>
        </div>
        <div
          v-show="canEdit(message.author.id)"
          class="media-right discussion-info">
          <img
            src="~/assets/images/ic-edit-passive.svg"
            alt="Edit discussion"
            title="Edit discussion">
          <img
            src="~/assets/images/ic-trashcan-passive.svg"
            alt="Delete discussion"
            title="Delete discussion">
        </div>
      </section>
    </div>
    <div v-else />
  </div>
</template>

<script>
import _get from 'lodash/get'
import updateDiscussion from '@/apollo/mutations/updateDiscussion'

export default {
  name: 'DiscussionCard',
  props: {
    discussion: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editThread: false,
      editAnswer: 0,
      headline: this.discussion.headline,
      body: this.discussion.body
    }
  },
  computed: {
    messages () {
      return _get(this, 'discussion.answers.messages', [])
    }
  },
  methods: {
    _get,
    canEdit (id) {
      if (this.$auth.$storage.getState('isAdmin')) {
        // admins can edit anything
        return true
      }
      // only author otherwise
      return id === _get(this, '$store.state.auth.personId', NaN)
    },
    authorsAvatar (name = '') {
      return `${name}'s avatar`
    },
    formatDate (date) {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return ''
      }
      const dateString = dateObj.toISOString()
      return dateString.substring(0, dateString.indexOf('T'))
    },
    saveTopic () {
      const variables = {
        threadId: this.discussion.id,
        headline: this.headline,
        body: this.body,
      }

      this.$apollo.mutate({ mutation: updateDiscussion, variables })
        .then((result) => {
          const id = _get(result, 'data.updateThreadById.thread.id')
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
  }
}
</script>
