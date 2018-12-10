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
            <search class="navbar-item has-dropdown is-active" />
          </div>
          <div class="navbar-item">
            <img
              class="hoverable-icon"
              src="~/assets/images/ic-activity.svg">
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
import Search from './Search.vue'

export default {
  name: 'TopNav',
  components: {
    SignIn,
    DraftTab,
    Search
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
