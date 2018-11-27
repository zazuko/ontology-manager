<template>
  <span>
    <button
      v-show="!loggedIn"
      class="button is-small is-info is-outlined"
      @click.prevent="signIn">
      <span>Sign In</span>
    </button>
    <button
      v-show="loggedIn"
      class="button is-small is-info is-outlined"
      @click.prevent="signOut">
      <span>Sign Out</span>
    </button>
    <div class="modal signin-modal">
      <div class="modal-background" />
      <div class="modal-card has-text-centered">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Sign In
          </p>
          <button
            class="delete"
            aria-label="close" />
        </header>
        <section class="modal-card-body">
          <p>
            DCF uses GitHub as a collaboration platform for the ontology management.
            Therefore you require a GitHub account to collaborate on DCF.
          </p>
          <p>
            <img
              src="~/assets/images/github-logo.png"
              alt="GitHub logo">
          </p>
        </section>
        <footer class="modal-card-foot">
          <div class="column">
            <p>I already have a GitHub account</p>
            <button class="button is-success">Sign In</button>
          </div>
          <div class="column">
            <p>I don't have a GitHub account</p>
            <button class="button is-success">Sign Up</button>
          </div>
        </footer>
      </div>
    </div>
  </span>
</template>

<script>
import axios from 'axios'
import _get from 'lodash/get'
import { toastClose } from '@/libs/utils'

export default {
  name: 'SignIn',
  components: {},
  computed: {
    loggedIn () {
      return this.$auth && this.$auth.$state.loggedIn
    }
  },
  mounted () {
    this.authenticate()
  },
  methods: {
    async signIn () {
      try {
        this.$toast.show('Logging in...')
        const loggedIn = this.$auth.$state.loggedIn
        await this.$auth.loginWith('github')
        await this.authenticate(loggedIn)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
        this.$toast.error('Error while authenticating', toastClose)
      }
    },
    async signOut () {
      this.$auth.logout()
      await this.$apolloHelpers.onLogout()
      this.$emit('loggedOut')
    },
    async authenticate (loggedIn) {
      if (!loggedIn && Object.keys(this.$store.state.auth || {}).length) {
        const name = _get(this, '$store.state.auth.user.name', '')
        const username = _get(this, '$store.state.auth.user.login', '')
        const id = _get(this, '$store.state.auth.user.id', '')
        let email = _get(this, '$store.state.auth.user.email', '')

        if ([name, id].every(Boolean)) {
          try {
            // if github user set their email as 'private', email ends up 'null' here
            // so we have to fetch it via the API
            if (!email) {
              const headers = { headers: { authorization: this.$auth.getToken('github') } }
              const result = await axios.get('https://api.github.com/user/emails', headers)
              email = _get(result, 'data[0].email')
              if (!email) {
                throw new Error('OAuth login failed: email not found')
              }
            }

            // check token then link oauth account/token to local account/token
            const headers = { headers: { authorization: this.$auth.getToken('github') } }
            const result = await axios.post('/api/link', { email, name, id, username }, headers)
              .catch((err) => {
                this.$toast.error(`Server Error: ${err.response.data.message || err.message}`, toastClose)
              })

            const jwtToken = _get(result, 'data.jwtToken')
            this.$auth.$storage.setState('isAdmin', _get(result, 'data.isAdmin'))
            this.$auth.$storage.setState('personId', _get(result, 'data.personId'))
            this.$auth.$storage.setState('hats', _get(result, 'data.personHats'))

            if (!jwtToken) {
              throw new Error('Account linking failed.')
            }
            this.$apolloHelpers.onLogin(jwtToken)
          }
          catch (err) {
            this.$toast.error(err, toastClose)
            await this.$apolloHelpers.onLogout()
          }
        }
      }
    }
  }
}
</script>
