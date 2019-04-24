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
      <div class="modal-card">
        <a
          class="signin-modal-close"
          aria-label="close"
          @click="modalIsOpen = false">
          ×
        </a>
        <header class="modal-card-head">
          <p class="modal-card-title">
            Signing In &amp; Contributor License Agreement
          </p>
        </header>
        <section class="modal-card-body content">
          <p>
            Thank you for your interest in contributing to the project
            <em>{{ $store.state.config.editor.meta.title }}</em> ("Project").
          </p>

          <p>
            This document clarifies the terms under which you, the person listed below,
            may make contributions to the Project that is published under the public domain using the CC0.
          </p>

          <p>
            By signing in, you accept and agree to the following terms and conditions
            for your present and future contributions that are submitted to the Project under the terms
            of this CLA.
          </p>

          <h2 class="subtitle">
            License
          </h2>

          <p>
            The Project, including code contributions and all related materials, is released under the
            terms of the
            <a href="https://creativecommons.org/publicdomain/zero/1.0/">Creative Commons Zero 1.0 Universal</a>
            license. Through this license, all copyright and related rights to the material available on this
            website and contained in its ontology repository
            <a :href="repo">{{ repo }}</a> are waived.
          </p>

          <h2 class="subtitle">
            You certify that:
          </h2>

          <ul>
            <li>
              <p>Your contributions are either:</p>
              <ol>
                <li>
                  Created in whole or in part by you and you have the right to submit it under the designated
                  license; or
                </li>
                <li>
                  Based upon previous work that, to the best of your knowledge, is covered under an appropriate
                  open source license and you have the right under that license to submit that work with
                  modifications, whether created in whole or in part by you, under the designated license; or
                </li>
                <li>
                  Provided directly to you by some other person who certified (1) or (2) and you have not modified
                  them.
                </li>
              </ol>
            </li>
            <li>
              You understand and agree that the Project and your contributions are public and that a record of
              the contributions (including all metadata and personal information that you submit with them) is
              maintained indefinitely and may be redistributed where they are relevant.
            </li>
            <li>
              <p>
                You are granting your contributions to Project members under the terms of the Creative
                Commons Zero 1.0 Universal license - in effect, you waive all copyright and related or neighboring
                rights to the text, code or documents that you contribute to the fullest extent possible under law.
              </p>
            </li>
          </ul>

          <p>
            {{ $store.state.config.editor.text.login }}
          </p>

          <div class="columns has-text-centered">
            <div class="column">
              <p class="info">I already have a GitHub account</p>
              <button
                id="sign-in-from-modal"
                class="button is-info is-fullwidth"
                @click.prevent="signIn">
                I Agree
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
    },
    repo () {
      return 'https://github.com/' + [
        this.$store.state.config.editor.github.owner,
        this.$store.state.config.editor.github.repo,
        'tree',
        this.$store.state.config.editor.github.branch
      ].join('/')
    }
  },
  data () {
    return {
      modalIsOpen: false
    }
  },
  methods: {
    async signIn () {
      await this.$auth.loginWith(this.$store.state.config.editor.loginStrategy)
      this.modalIsOpen = false
    },
    async signOut () {
      await this.$auth.logout()
      await this.$apolloHelpers.onLogout()
      if (process.browser) {
        const cookies = document.cookie.split(';')

        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i]
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      }
      this.$emit('loggedOut')
    }
  }
}
</script>
