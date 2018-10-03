<template>
  <section class="hero is-small is-info">
    <div class="hero-head">
      <nav class="navbar">
        <div class="navbar-brand">
          <a class="navbar-item">
            <h1 class="title">Conversation</h1>
          </a>
        </div>
        <div class="navbar-menu">
          <div class="navbar-end">
            <a class="navbar-item">
              <nuxt-link
                :to="{ name: 'discussions-new', query: { iri: iri } }"
                class="button is-info is-inverted">
                New Thread
              </nuxt-link>
            </a>
          </div>
        </div>
      </nav>
    </div>
    <div class="hero-body">
      <div v-if="discussions">
        <article
          v-for="discussion in discussions.discussions"
          :key="discussion.id"
          class="media">
          <figure class="media-left">
            <p class="image is-64x64">
              <img
                :src="discussion.author.avatar"
                :alt="authorsAvatar(discussion.author.name)">
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <h3 class="subtitle">
                <nuxt-link :to="{ name: 'discussions-id', params: { id: discussion.id } }">
                  {{ discussion.headline }}
                </nuxt-link>
              </h3>
              <p>
                {{ cut(discussion.body) }}
              </p>

              <p>
                <strong>{{ discussion.author.name }}</strong> <small>Created {{ discussion.createdAt }}</small>
              </p>
            </div>
          </div>
          <div class="media-right">
            <nuxt-link :to="{ name: 'discussions-id', params: { id: discussion.id } }">
              <span class="icon is-small">
                <i class="mdi mdi-message-reply-text" />
              </span>
              {{ answersCount(discussion) }}
            </nuxt-link>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script>
import _get from 'lodash/get'
import discussions from '@/apollo/queries/discussionsByIri'

export default {
  name: 'Discussions',
  props: ['iri'],
  methods: {
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
      query: discussions,
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
