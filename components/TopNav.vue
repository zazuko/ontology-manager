<template>
  <nav class="navbar is-white topNav">
    <div class="container">
      <div class="navbar-brand">
        <router-link
          :to="{ name: 'index', params: {} }"
          class="navbar-item">
          <img
            src="~/assets/images/logo.png"
            style="filter: invert(100%);"
            height="28">
        </router-link>
        <div
          :class="{'is-active': isActive}"
          class="navbar-burger burger"
          data-target="topNav"
          @click="toggle()">
          <span/>
          <span/>
          <span/>
        </div>
      </div>
      <div
        id="topNav"
        :class="{'is-active': isActive}"
        class="navbar-menu">
        <div class="navbar-start">
          <router-link
            :to="{ name: 'index', params: {} }"
            class="navbar-item">Home</router-link>
          <router-link
            :to="{ name: 'discussions', params: {} }"
            class="navbar-item">Discussions</router-link>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="field is-grouped">
              <p class="control">
                <sign-in
                  @loggedOut="loggedOut" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import SignIn from '~/components/SignIn.vue'
import { toastClose } from '~/libs/utils'

export default {
  components: {
    SignIn
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
