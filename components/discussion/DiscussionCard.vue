<template>
  <div>
    <!-- TODO: if this discussion is a proposal conversation
  we need to redirect user to the proposal display -->
    <h2 class="title is-4">
      {{ discussion.headline }}
    </h2>
    <section>
      <div class="media topic-box">
        <figure class="media-left">
          <p
            v-if="discussion.author"
            class="image is-64x64">
            <img
              :src="discussion.author.avatar"
              :alt="authorsAvatar(discussion.author.name)">
          </p>
        </figure>
        <div class="media-content">
          <div class="content">
            <p class="content">
              {{ discussion.body }}
            </p>
          </div>
        </div>
        <div class="media-right discussion-info">
          <!-- TODO: edit/delete icons but outside of box in a level -->
        </div>
      </div>
      <div class="topic-info level">
        <div class="level-left">
          <span
            v-if="discussion.createdAt"
            class="creation-info">
            Created on {{ discussion.createdAt | formatDate }} by
          </span>
          <span
            v-if="discussion.author"
            class="author-info">
            &nbsp;{{ discussion.author.name }}
          </span>
        </div>
        <div class="level-right">
          <span class="answers-count">
            <span class="icon is-small">
              <i class="mdi mdi-message-reply-text" />
            </span>
            {{ answersCount(discussion) }}
          </span>
        </div>
      </div>
    </section>

    <div v-if="discussion.answers">
      <hr />
      <section
        v-for="message in discussion.answers.messages"
        :key="message.id"
        class="media answer-box">
        <figure class="media-left">
          <p
            v-if="message.author"
            class="image is-48x48">
            <img
              :src="message.author.avatar"
              :alt="authorsAvatar(message.author.name)">
          </p>
        </figure>
        <div class="media-content">
          <div class="answer-info">
            <span
              v-if="message.author"
              class="author-info">
              {{ message.author.name }}
            </span>
            <span
              v-if="message.createdAt"
              class="creation-info">
              commented on {{ message.createdAt | formatDate }}
            </span>
          </div>
          <div class="content">
            <p class="content">
              {{ message.body }}
            </p>
          </div>
        </div>
        <div class="media-right discussion-info">
          <!-- TODO: edit icon button -->
        </div>
      </section>
    </div>
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
  methods: {
    authorsAvatar (name = '') {
      return `${name}'s avatar'`
    },
    answersCount (discussion) {
      return _get(discussion, 'answers.messages', []).length
    }
  }
}
</script>
