<template>
  <section class="section">
    <h1 class="title is-2">Conversations</h1>

    <div class="discussion-list">
      <div class="discussion-list-header">
        <div class="field is-pulled-left">
          <p class="control has-icons-left">
            <!--TODO <input
              class="input"
              type="text"
              placeholder="Search">
            <span class="icon is-small is-left">
              <i class="mdi mdi-magnify"></i>
            </span>-->
          </p>
        </div>
        <template v-if="$auth && $auth.$state.loggedIn">
          <nuxt-link
            :to="{ name: 'discussion-new', query: { iri: iri } }"
            class="button is-pulled-right is-info">
            New Thread
          </nuxt-link>
        </template>
      </div>
      <div class="discussion-list-body">
        <template v-if="_get(discussions, 'discussions.length', 0) === 0">
          <p class="discussion-list-item">
            There is no ongoing conversation about this object.
          </p>
        </template>
        <template v-else>
          <div
            class="discussion-list-item media"
            v-for="discussion in discussions.discussions"
            :key="discussion.id">
            <figure class="media-left">
              <img
                class="discussion-list-avatar"
                :src="discussion.author.avatar"
                :alt="authorsAvatar(discussion.author.name)">
            </figure>
            <div class="media-content">
              <h3 class="discussion-list-title">
                <nuxt-link :to="{ name: 'discussion-id', params: { id: discussion.id } }">
                  {{ discussion.headline }}
                </nuxt-link>
              </h3>
              <p class="discussion-list-content">
                {{ cut(discussion.body) }}
              </p>
            </div>
            <div class="media-right">
              <nuxt-link :to="{ name: 'discussion-id', params: { id: discussion.id } }">
                <span class="discussion-list-creation-info">
                  Created {{ discussion.createdAt | formatDate }} by
                </span>
                <span class="discussion-list-author-info">
                  {{ discussion.author.name }}
                </span>
                <span class="discussion-list-answers-count">
                  {{ answersCount(discussion) }}
                  <span class="icon is-small">
                    <i class="mdi mdi-message-reply-text" />
                  </span>
                </span>
              </nuxt-link>
            </div>
          </div>
        </template>
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
      fetchPolicy: 'cache-and-network',
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    }
  }
}
</script>
