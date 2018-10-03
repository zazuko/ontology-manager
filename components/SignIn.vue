<template>
  <span>
    <button
      v-show="!loggedIn"
      class="button is-small is-info is-outlined"
      @click="signIn">
      <span>Sign In</span>
    </button>
    <button
      v-show="loggedIn"
      class="button is-small is-info is-outlined"
      @click="signOut">
      <span>Sign Out</span>
    </button>
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
      } catch (err) {
        console.error(err)
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
        const email = _get(this, '$store.state.auth.user.email', '')
        const name = _get(this, '$store.state.auth.user.name', '')
        const id = _get(this, '$store.state.auth.user.id', '')

        if ([email, name, id].every(Boolean)) {
          try {
            // check token then link oauth account/token to local account/token
            const headers = { headers: { authorization: this.$auth.getToken('github') } }
            const result = await axios.post('/api/link', { email, name, id }, headers)
              .catch((err) => {
                this.$toast.error(`Server Error: ${err.response.data.message}`, toastClose)
              })
            const jwtToken = _get(result, 'data.jwtToken')
            if (!jwtToken) throw new Error('Account linking failed.')
            this.$apolloHelpers.onLogin(jwtToken)
          } catch (err) {
            this.$toast.error(err, toastClose)
          }
        }
      }
    }
  }
}
</script>
