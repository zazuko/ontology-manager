<template>
  <div>
    <div class="level">
      <div class="level-left">
        <h2 class="title is-2">
          {{ threadHeadline }}
        </h2>
      </div>
      <div
        v-show="canEdit(discussion.author.id)"
        class="discussion-actions level-right">
        <img
          class="hoverable-icon"
          src="~/assets/images/ic-edit.svg"
          alt="Edit thread"
          title="Edit thread"
          @click="editThread = !editThread">
        <img
          class="hoverable-icon"
          src="~/assets/images/ic-trashcan.svg"
          alt="Delete thread"
          title="Delete thread"
          @click="deleteConfirm = 'thread'">
      </div>
    </div>

    <div
      v-show="!editThread"
      class="media discussion-message is-from-thread-author">
      <figure class="media-left">
        <img
          class="discussion-avatar"
          :src="discussion.author.avatar"
          :alt="authorsAvatar(discussion.author.name)">
      </figure>
      <div class="media-content">
        <p
          class="discussion-message-content"
          v-html="discussion.body" />
      </div>
    </div>

    <div
      v-show="editThread"
      class="discussion-message discussion-form is-from-thread-author">
      <div class="media">
        <figure class="media-left">
          <img
            class="discussion-avatar"
            :src="discussion.author.avatar"
            :alt="authorsAvatar(discussion.author.name)">
        </figure>

        <div class="media-content">
          <div class="field">
            <div class="control">
              <input
                v-model="threadHeadline"
                class="input"
                type="text"
                placeholder="Topic title">
            </div>
          </div>
          <div class="field">
            <div class="control">
              <editor v-model="threadBody" />
            </div>
          </div>
        </div>

        <div class="media-right">
          <div class="field top">
            <div class="control has-text-right">
              <span
                class="icon is-medium"
                @click="editThread = false">
                <i class="mdi mdi-close" />
              </span>
            </div>
          </div>
          <div class="field discussion-post-button">
            <div class="control">
              <button
                class="button is-info"
                @click.prevent="saveTopic()">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="discussion-infos level">
      <div class="level-left">
        <span class="creation-info">
          Created on {{ formatDate(discussion.createdAt) }} by
        </span>
        <span class="author-info">
          &nbsp;{{ discussion.author.name }}
        </span>
      </div>
      <div class="level-right">
        <span class="count-info">
          {{ messages.length }}
          <span class="icon is-small">
            <i class="mdi mdi-message-reply-text" />
          </span>
        </span>
      </div>
    </div>

    <hr v-show="messages.length" />

    <div v-if="messages.length">
      <div
        class="discussion-message"
        :class="{
          'is-from-thread-author': discussion.author.id == message.author.id,
          'has-hat': message.hat,
          'discussion-form': editMessage === message.id
        }"
        v-for="message in messages"
        :key="message.id">
        <div
          class="media"
          v-show="message.id && editMessage !== message.id">
          <figure class="media-left">
            <img
              class="discussion-avatar"
              :src="message.author.avatar"
              :alt="authorsAvatar(message.author.name)">
          </figure>
          <div class="media-content">
            <div class="discussion-message-info">
              <span
                class="author-info">
                {{ message.author.name }}
              </span>
              <span class="creation-info">
                commented on {{ message.createdAt | formatDate }}
              </span>
            </div>
            <p
              class="discussion-message-content"
              v-html="message.body" />
            <div
              v-show="message.hat"
              class="discussion-message-hat">
              {{ _get(message, 'hat.title', '') }}
            </div>
          </div>
          <div
            v-show="canEdit(message.author.id)"
            class="media-right discussion-actions">
            <img
              class="hoverable-icon"
              src="~/assets/images/ic-edit.svg"
              alt="Edit message"
              title="Edit message"
              @click="editMessageSetup(message)">
            <img
              class="hoverable-icon"
              src="~/assets/images/ic-trashcan.svg"
              alt="Delete message"
              title="Delete message"
              @click="deleteConfirm = message.id">
          </div>
        </div>

        <div
          class="media"
          v-show="editMessage === message.id">
          <figure class="media-left">
            <img
              class="discussion-avatar"
              :src="message.author.avatar"
              :alt="authorsAvatar(message.author.name)">
          </figure>
          <div class="media-content">
            <div class="field">
              <div class="control">
                <editor v-model="messageBody" />
              </div>
            </div>
          </div>
          <div class="media-right">
            <div class="field top">
              <div class="control has-text-right">
                <span
                  class="icon is-medium"
                  title="Cancel"
                  @click="editMessage = 0">
                  <i class="mdi mdi-close" />
                </span>
              </div>
            </div>
            <div
              v-show="_get(message, 'author.holding.hats.length', 0)"
              class="field top">
              <div class="control is-expanded">
                <div class="select is-fullwidth">
                  <select
                    v-model="selectedHat">
                    <option value="">
                      Answer as…
                    </option>
                    <option
                      v-for="item in _get(message, 'author.holding.hats', [])"
                      :key="item.hat.id"
                      :value="item.hat.id">
                      {{ item.hat.title }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="field discussion-post-button">
              <div class="control">
                <button
                  class="button is-info"
                  @click.prevent="saveMessage()">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else />
    <div
      :class="{
        'is-active': deleteConfirm
      }"
      class="modal">
      <div class="modal-background"></div>
      <div
        v-show="deleteConfirm === 'thread'"
        class="modal-card">
        <section class="modal-card-body">
          <p>
            You are about to delete this thread, are you sure?
          </p>
        </section>
        <footer class="modal-card-foot">
          <button
            class="button is-danger"
            @click="closeThread">
            Delete
          </button>
          <button
            class="button"
            @click="deleteConfirm = false">
            Cancel
          </button>
        </footer>
      </div>
      <div
        v-show="typeof deleteConfirm === 'number'"
        class="modal-card">
        <section class="modal-card-body">
          <p>
            You are about to delete a message, are you sure?
          </p>
        </section>
        <footer class="modal-card-foot">
          <button
            class="button is-danger"
            @click="deleteMessage(deleteConfirm)">
            Delete
          </button>
          <button
            class="button"
            @click="deleteConfirm = false">
            Cancel
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import _get from 'lodash/get'
import Editor from '@/components/editor/Editor'
import changeDiscussionStatus from '@/apollo/mutations/changeDiscussionStatus'
import updateDiscussion from '@/apollo/mutations/updateDiscussion'
import updateMessage from '@/apollo/mutations/updateMessage'
import deleteMessage from '@/apollo/mutations/deleteMessage'

export default {
  name: 'DiscussionCard',
  props: {
    discussion: {
      type: Object,
      required: true
    }
  },
  components: {
    Editor
  },
  data () {
    return {
      editMessage: 0,
      selectedHat: '',
      originalHat: '',
      messageBody: '',
      editThread: false,
      deleteConfirm: false,
      threadHeadline: this.discussion.headline,
      threadBody: this.discussion.body
    }
  },
  computed: {
    messages () {
      return _get(this, 'discussion.answers.messages', [])
    }
  },
  watch: {
    'discussion.headline' () {
      this.threadHeadline = this.discussion.headline
    },
    'discussion.body' () {
      this.threadBody = this.discussion.body
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
        headline: this.threadHeadline,
        body: this.threadBody
      }

      this.$apollo.mutate({ mutation: updateDiscussion, variables })
        .then((result) => {
          this.editThread = false
          this.$emit('refreshDiscussions')
        })
        .catch((err) => {
          console.error(err)
          this.$sentry.captureException(err)
        })
    },
    closeThread () {
      const variables = {
        threadId: this.discussion.id,
        newStatus: 'HIDDEN'
      }

      this.$apollo.mutate({ mutation: changeDiscussionStatus, variables })
        .then((result) => {
          this.deleteConfirm = false
          this.$emit('refreshDiscussions')
          this.$router.push({ path: '/' })
        })
        .catch((err) => {
          console.error(err)
          this.$sentry.captureException(err)
        })
    },
    editMessageSetup (message) {
      this.editMessage = message.id
      this.messageBody = message.body
      if (message.hat) {
        this.originalHat = this.selectedHat = message.hat.id
      }
      else {
        this.originalHat = this.selectedHat = ''
      }
    },
    saveMessage () {
      const variables = {
        messageId: this.editMessage,
        body: this.messageBody
      }

      if (this.selectedHat) {
        variables.hatId = this.selectedHat
      }
      else if (this.originalHat) {
        variables.hatId = null
      }

      this.$apollo.mutate({ mutation: updateMessage, variables })
        .then((result) => {
          this.editMessage = 0
          this.$emit('refreshDiscussions')
        })
        .catch((err) => {
          console.error(err)
          this.$sentry.captureException(err)
        })
    },
    deleteMessage (messageId) {
      const variables = {
        messageId
      }

      this.$apollo.mutate({ mutation: deleteMessage, variables })
        .then((result) => {
          this.deleteConfirm = false
          this.$emit('refreshDiscussions')
        })
        .catch((err) => {
          console.error(err)
          this.$sentry.captureException(err)
        })
    }
  }
}
</script>
