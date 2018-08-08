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
export default {
  name: 'SignIn',
  components: {},
  computed: {
    loggedIn () {
      console.log(this.$auth.getToken('github'))
      return this.$auth.loggedIn
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
