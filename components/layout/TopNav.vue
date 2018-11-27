<template>
  <nav class="navbar top-nav">
    <div class="container">
      <div class="navbar-brand">
        <nuxt-link
          :to="{ name: 'index', params: {} }"
          class="navbar-item">
          <img src="~/assets/images/dcf-logo.svg">
        </nuxt-link>
        <div
          :class="{'is-active': isActive}"
          class="navbar-burger burger"
          data-target="top-nav"
          @click.prevent="toggle()">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div
        id="top-nav"
        :class="{'is-active': isActive}"
        class="navbar-menu">
        <div class="navbar-start">
          <nuxt-link
            :to="{ name: 'index', params: {} }"
            class="navbar-item">
            Home
          </nuxt-link>
          <draft-tab class="navbar-item" />
          <nuxt-link
            :to="{ name: 'admin-proposals', params: {} }"
            class="navbar-item">
            Admin
          </nuxt-link>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="field">
              <p class="control has-icons-left">
                <input
                  class="input"
                  type="text"
                  placeholder="Search">
                <span class="icon is-small is-left">
                  <i class="mdi mdi-magnify"></i>
                </span>
              </p>
            </div>
          </div>
          <div class="navbar-item">
            <div class="field is-grouped">
              <sign-in @loggedOut="loggedOut" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { toastClose } from '@/libs/utils'
import SignIn from './SignIn.vue'
import DraftTab from './DraftTab.vue'

export default {
  name: 'TopNav',
  components: {
    SignIn,
    DraftTab
  },
  data () {
    return {
      isActive: false
    }
  },
  methods: {
    loggedOut () {
      this.$toast.success('Signed out successfully!', toastClose)
    },
    toggle () {
      this.isActive = !this.isActive
    }
  }
}
</script>
