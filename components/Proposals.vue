<template>
  <section class="hero is-small is-primary">
    <div class="hero-head">
      <nav class="navbar">
        <div class="navbar-brand">
          <a class="navbar-item">
            <h1 class="title">Proposals</h1>
          </a>
        </div>
        <div class="navbar-end">
          <span class="navbar-item">
            <nuxt-link
              v-if="!isClass"
              :to="{ name: 'proposal-new-class', query: { iri: iri } }"
              class="button is-primary is-inverted">
              Request New Class
            </nuxt-link>
          </span>
          <span
            v-if="isClass"
            class="navbar-item">
            <nuxt-link
              :to="{ name: 'proposal-new-property', query: { iri: iri } }"
              class="button is-primary is-inverted">
              Request New Property
            </nuxt-link>
          </span>
        </div>
      </nav>
    </div>
    <div class="hero-body">
      <div v-if="proposals">
        <article
          v-for="proposal in proposals.proposals"
          :key="proposal.id"
          class="media">
          <figure class="media-left">
            <p class="image is-64x64">
              <img
                :src="proposal.author.avatar"
                :alt="authorsAvatar(proposal.author.name)">
            </p>
          </figure>
          <div class="media-content">
            <div class="content">
              <h3 class="subtitle">
                {{ proposal.headline }}
              </h3>
              <p>
                {{ cut(proposal.body) }}
              </p>

              <p>
                <strong>{{ proposal.author.name }}</strong> <small>Created {{ proposal.createdAt }}</small>
              </p>
            </div>
          </div>
          <div class="media-right">
            <!-- <nuxt-link :to="{ name: 'proposal-id', params: { id: proposal.id } }">
              <span class="icon is-small">
                <i class="mdi mdi-message-reply-text" />
              </span>
              {{ answersCount(proposal) }}
            </nuxt-link> -->
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script>
import _get from 'lodash/get'
import proposals from '@/apollo/queries/proposalsByIri'

export default {
  name: 'Proposals',
  props: {
    iri: {
      type: String,
      required: true
    },
    isClass: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    authorsAvatar (name = '') {
      return `${name}'s avatar'`
    },
    cut (string) {
      return (string || '').substr(0, 150)
    },
    answersCount (proposal) {
      return _get(proposal, 'answers.messages', []).length
    }
  },
  apollo: {
    proposals: {
      query: proposals,
      variables () {
        return {
          iri: this.iri
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  },
  validate () {

  }
}
</script>
