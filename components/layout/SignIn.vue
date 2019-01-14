<template>
  <div>
    <button
      v-show="!loggedIn"
      id="sign-in"
      class="button is-small is-info is-outlined"
      @click="modalIsOpen = true">
      <span>Sign In</span>
    </button>
    <button
      v-show="loggedIn"
      id="sign-out"
      class="button is-small is-info is-outlined"
      @click.prevent="signOut">
      <span>Sign Out</span>
    </button>
    <div
      v-show="modalIsOpen"
      class="modal signin-modal is-active">
      <div class="modal-background" />
      <div class="modal-card has-text-centered">
        <a
          class="signin-modal-close"
          aria-label="close"
          @click="modalIsOpen = false">
          ×
        </a>
        <header class="modal-card-head">
          <p class="modal-card-title">
            Sign In
          </p>
        </header>
        <section class="modal-card-body">
          <p>
            DCF uses GitHub as a collaboration platform for the ontology management.
            Therefore you require a GitHub account to collaborate on DCF.
          </p>
          <p>
            <img
              class="github-logo"
              src="~/assets/images/github-logo.png"
              alt="GitHub logo">
          </p>
          <div class="columns">
            <div class="column">
              <p class="info">I already have a GitHub account</p>
              <button
                id="sign-in-from-modal"
                class="button is-info is-fullwidth"
                @click.prevent="signIn">
                Sign In
              </button>
            </div>
            <div class="column">
              <p class="info">I don't have a GitHub account</p>
              <button
                id="sign-up-from-modal"
                class="button is-dark-info is-fullwidth"
                @click.prevent="signIn">
                Sign Up
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import Auth from '@/mixins/auth'

export default {
  name: 'SignIn',
  extends: Auth,
  components: {},
  computed: {
    loggedIn () {
      return this.$auth && this.$auth.$state.loggedIn
    }
  },
  data () {
    return {
      modalIsOpen: false
    }
  },
  methods: {
    async signIn () {
      await this.$auth.loginWith(process.env.AUTH_STRATEGY)
      this.modalIsOpen = false
    },
    async signOut () {
      await this.$auth.logout()
      await this.$apolloHelpers.onLogout()
      this.$emit('loggedOut')
    }
  }
}
</script>
