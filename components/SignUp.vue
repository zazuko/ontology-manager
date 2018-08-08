<template>
  <div class="signup">
    <form>
      <fieldset>
        <legend>Sign up</legend>

        <label for="firstName">First Name</label>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          name="firstName"
          value="">

        <label for="lastName">Last Name</label>
        <input
          id="lastName"
          v-model="lastName"
          type="text"
          name="lastName"
          value="">

        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="text"
          name="email"
          value="">

        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          value="">
      </fieldset>
      <button
        type="button"
        name="button"
        @click.prevent="signUp()">Sign Up</button>
    </form>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'SignUp',
  components: {},
  data () {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    }
  },
  methods: {
    async signUp () {
      const result = await this.$apollo.mutate({
        mutation: gql`mutation ($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
          registerPerson (input: {
            firstName: $firstName,
            lastName: $lastName,
            email: $email,
            password: $password
          }) {
            person {
              id
            }
          }
        }`,
        variables: {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        }
      })

      console.log(result)
    }
  }
}
</script>
