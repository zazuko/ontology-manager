<template>
  <div>
    <h2 class="title is-4">
      {{ discussion.headline }}
    </h2>
    <section>
      <div class="media topic-box">
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
        <div
          v-show="isOwn(discussion.author.id)"
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
          v-show="isOwn(message.author.id)"
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

export default {
  name: 'DiscussionCard',
  props: {
    discussion: {
      type: Object,
      required: true
    }
  },
  computed: {
    messages () {
      return _get(this, 'discussion.answers.messages', [])
    }
  },
  methods: {
    _get,
    isOwn (id) {
      // TODO: implement edit & trash
      return false
      // return id === _get(this, '$store.state.auth.personId', NaN)
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
    }
  }
}
</script>
