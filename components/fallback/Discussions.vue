<template>
  <section class="section has-background-white">

    <div class="level">
      <div class="level-left">
        <h1 class="title">Conversations</h1>
      </div>
      <div class="level-right">
        <nuxt-link
          :to="{ name: 'discussion-new', query: { iri: iri } }"
          class="button is-info">
          New Thread
        </nuxt-link>
      </div>
    </div>

    <div
      class="content"
      v-if="_get(discussions, 'discussions.length', 0) === 0">
      <p>
        There is no ongoing conversation about this object.
      </p>
    </div>
    <div
      v-else
      class="section">
      <div
        v-for="(discussion, index) in discussions.discussions"
        :key="discussion.id">
        <hr v-show="index !== 0">
        <article class="media">
          <figure class="media-left">
            <p class="image is-64x64">
              <img
                class="is-rounded"
                :src="discussion.author.avatar"
                :alt="authorsAvatar(discussion.author.name)">
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <h3 class="title is-5">
                <nuxt-link :to="{ name: 'discussion-id', params: { id: discussion.id } }">
                  {{ discussion.headline }}
                </nuxt-link>
              </h3>
              <p class="content">
                {{ cut(discussion.body) }}
              </p>
            </div>
          </div>
          <div class="media-right discussion-info">
            <nuxt-link :to="{ name: 'discussion-id', params: { id: discussion.id } }">
              <span class="author-info">
                {{ discussion.author.name }},
              </span>
              <span class="creation-info">
                {{ discussion.createdAt | formatDate }}
              </span>
              <br>
              <br>
              <span class="answers-count">
                <span class="icon is-small">
                  <i class="mdi mdi-message-reply-text" />
                </span>
                {{ answersCount(discussion) }}
              </span>
            </nuxt-link>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script>
import _get from 'lodash/get'
import discussionsByIri from '@/apollo/queries/discussionsByIri'

export default {
  name: 'Discussions',
  props: {
    iri: {
      type: String,
      required: true
    }
  },
  methods: {
    _get,
    authorsAvatar (name = '') {
      return `${name}'s avatar'`
    },
    cut (string) {
      return (string || '').substr(0, 150)
    },
    answersCount (discussion) {
      return _get(discussion, 'answers.messages', []).length
    }
  },
  apollo: {
    discussions: {
      query: discussionsByIri,
      variables () {
        return {
          iri: this.iri
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
