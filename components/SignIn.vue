<template>
  <div class="signin">
    <button
      v-show="loggedIn"
      @click="signOut">
      Sign Out
    </button>
    <button
      v-show="!loggedIn"
      @click="signIn">
      Sign In
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import _get from 'lodash/get'

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
      await this.$auth.loginWith('github')
      await this.authenticate()
      this.loggedIn = true
    },
    async signOut () {
      this.$auth.logout()
      await this.$apolloHelpers.onLogout()
      this.loggedIn = false
    },
    async authenticate () {
      if (Object.keys(this.$store.state.auth || {}).length) {
        const token = (this.$auth.getToken('github') || ' ').split(' ').slice(1)[0]
        const email = _get(this, '$store.state.auth.user.email', '')
        const name = _get(this, '$store.state.auth.user.name', '')
        const id = _get(this, '$store.state.auth.user.id', '')

        if ([token, email, name, id].every(Boolean)) {
          // check and link account to local account
          axios.post('/api/link', { token, email, name, id })
            .then(({data}) => this.$apolloHelpers.onLogin(data.jwtToken))
        }
      }
    }
  }
}
</script>
