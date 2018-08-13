<template>
  <div class="signin">
    <button
      v-if="loggedIn"
      @click="signOut">
      Sign Out
    </button>
    <button
      v-else
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
  computed: {
    loggedIn () {
      return this.$auth.loggedIn
    }
  },
  mounted () {
    const token = (this.$auth.getToken('github') || ' ').split(' ').slice(1)[0]
    const email = _get(this, '$store.state.auth.user.email', '')
    const name = _get(this, '$store.state.auth.user.name', '')
    const id = _get(this, '$store.state.auth.user.id', '')

    if ([token, email, name, id].every(Boolean)) {
      // check and link account to local account
      return axios.post('/api/link', { token, email, name, id })
    }
  },
  methods: {
    signIn () {
      this.$auth.loginWith('github')
    },
    signOut () {
      this.$auth.logout()
    }
  }
}
</script>
