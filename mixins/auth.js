import axios from 'axios'
import _get from 'lodash/get'
import { toastClose } from '@/libs/utils'

export default {
  name: 'Auth',
  async beforeMount () {
    if (!process.browser) {
      this.localUserRegistrationDone = true
      this.$store.dispatch('authProcessDone')
    }

    if (!_get(this, '$auth.$state.loggedIn')) {
      this.localUserRegistrationDone = true
    }
    if (_get(this, '$auth.$state.localUser') === true) {
      this.localUserRegistrationDone = true
    }
    if (this.localUserRegistrationDone === true) {
      return
    }
    await this.$apolloHelpers.onLogout()
    await this.authenticate()
    this.localUserRegistrationDone = true
    this.$store.dispatch('authProcessDone')
  },
  data () {
    return {
      localUserRegistrationDone: false
    }
  },
  methods: {
    async authenticate () {
      const tmp = Math.floor(Math.random() * 100000)
      const username = _get(this, '$store.state.auth.user.login')
      const id = _get(this, '$store.state.auth.user.id')
      const name = _get(this, '$store.state.auth.user.name') || username
      let email = _get(this, '$store.state.auth.user.email')

      if ([username, id].every(Boolean)) {
        // if github user set their email as 'private', email ends up 'null' here
        // so we have to fetch it via the API
        if (!email) {
          const headers = { headers: { authorization: this.$auth.getToken(process.env.AUTH_STRATEGY) } }
          const result = await axios.get('https://api.github.com/user/emails', headers)
          email = _get(result, 'data[0].email') || `${tmp}-unknown@example.com`
        }

        // check token then link oauth account/token to local account/token
        const headers = { headers: { authorization: this.$auth.getToken(process.env.AUTH_STRATEGY) } }
        let result
        try {
          result = await axios.post('/api/link', { email, name, id, username }, headers)
        }
        catch (err) {
          this.$sentry.captureException(err)
          this.$toast.error(`Server Error: ${err.response.data.message || err.message}`, toastClose)
          throw err
        }

        const jwtToken = _get(result, 'data.jwtToken')
        this.$auth.$storage.setState('isAdmin', _get(result, 'data.isAdmin'))
        this.$auth.$storage.setState('personId', _get(result, 'data.personId'))
        this.$auth.$storage.setState('hats', _get(result, 'data.personHats'))

        if (!jwtToken) {
          throw new Error('Account linking failed.')
        }
        await this.$apolloHelpers.onLogin(jwtToken)
        this.$auth.$storage.setState('localUser', true)
      }
    }
  }
}
