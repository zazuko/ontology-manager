<template>
  <div class="signin">
    <button
      v-show="$auth.$state.loggedIn"
      @click="signOut">
      Sign Out
    </button>
    <button
      v-show="!$auth.$state.loggedIn"
      @click="signIn">
      Sign In
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import _get from 'lodash/get'
import gql from 'graphql-tag'

export default {
  name: 'SignIn',
  components: {},
  data () {
    return {
      loggedIn: this.$store.state.auth.loggedIn
    }
  },
  mounted () {
    if (Object.keys(this.$store.state.auth || {}).length) {
      const token = (this.$auth.getToken('github') || ' ').split(' ').slice(1)[0]
      const email = _get(this, '$store.state.auth.user.email', '')
      const name = _get(this, '$store.state.auth.user.name', '')
      const id = _get(this, '$store.state.auth.user.id', '')

      if ([token, email, name, id].every(Boolean)) {
        // check and link account to local account
        return axios.post('/api/link', { token, email, name, id })
          .then(async () => {
            // generate a JWT for authenticated user graphql
            try {
              const res = await this.$apollo.mutate({
                mutation: gql`mutation ($oauthToken: String!, $oauthProvidedId: Int!) {
                  authenticate (input: {
                    oauthToken: $oauthToken,
                    oauthProvidedId: $oauthProvidedId
                  }) {
                    jwtToken
                  }
                }`,
                variables: {
                  oauthToken: token,
                  oauthProvidedId: id
                }
              }).then(({data}) => {
                return data && data.authenticate
              })

              await this.$apolloHelpers.onLogin(res.jwtToken)
            } catch (e) {
              console.error(e)
            }
          })
      }
    }
  },
  methods: {
    async signIn () {
      await this.$auth.loginWith('github')
    },
    async signOut () {
      this.$auth.logout()
      await this.$apolloHelpers.onLogout()
    }
  }
}
</script>
