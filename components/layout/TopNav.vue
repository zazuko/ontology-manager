<template>
  <nav
    id="page-top"
    class="navbar top-nav">
    <div class="container">
      <div class="navbar-brand">
        <nuxt-link
          :to="{ name: 'index', params: {} }"
          class="navbar-item">
          <img :src="$store.state.config.editor.logoUrl">
          <h1 class="product-name">{{ $store.state.config.editor.meta.title }}</h1>
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
          <draft-tab
            v-show="$auth && $auth.$state.loggedIn"
            class="navbar-item" />
          <nuxt-link
            v-show="$auth && $auth.$state.loggedIn && $store.state.auth.isAdmin"
            :to="{ name: 'zom-admin-proposals', params: {} }"
            class="navbar-item">
            Admin
          </nuxt-link>
        </div>
        <div class="navbar-end">
          <div class="navbar-item navbar-item--search">
            <search class="navbar-item has-dropdown is-active" />
          </div>
          <div class="navbar-item">
            <activity-log class="navbar-item has-dropdown is-active" />
          </div>
          <div
            v-show="!$store.state.config.setup"
            class="navbar-item">
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
import ActivityLog from './ActivityLog'
import DraftTab from './DraftTab'
import Search from './Search'
import SignIn from './SignIn'

export default {
  name: 'TopNav',
  components: {
    ActivityLog,
    DraftTab,
    Search,
    SignIn
  },
  data () {
    return {
      isActive: false
    }
  },
  methods: {
    loggedOut () {
      this.$toast.success('Signed out successfully!', toastClose).goAway(1600)
    },
    toggle () {
      this.isActive = !this.isActive
    }
  }
}
</script>
