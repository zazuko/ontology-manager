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
import { toastClose } from '~/libs/utils'

export default {
  name: 'SignIn',
  components: {},
  data () {
    return {
      loggedIn: this.$auth.$state.loggedIn
    }
  },
  mounted () {
    this.authenticate()
  },
  methods: {
    async signIn () {
      try {
        this.$toast.show('Logging in...')
        await this.$auth.loginWith('github')
        await this.authenticate()
        this.loggedIn = true
      } catch (err) {
        console.error(err)
        this.$toast.error('Error while authenticating', toastClose)
      }
    },
    async signOut () {
      this.$auth.logout()
      await this.$apolloHelpers.onLogout()
      this.loggedIn = false
      this.$emit('loggedOut')
    },
    async authenticate () {
      if (Object.keys(this.$store.state.auth || {}).length) {
        const token = (this.$auth.getToken('github') || ' ').split(' ').slice(1)[0]
        const email = _get(this, '$store.state.auth.user.email', '')
        const name = _get(this, '$store.state.auth.user.name', '')
        const id = _get(this, '$store.state.auth.user.id', '')

        if ([token, email, name, id].every(Boolean)) {
          // check and link account to local account
          const result = await axios.post('/api/link', { token, email, name, id })
          const jwtToken = _get(result, 'data.jwtToken')
          if (!jwtToken) throw new Error('Account linking failed.')
          this.$apolloHelpers.onLogin(jwtToken)
        }
      }
    }
  }
}
</script>
