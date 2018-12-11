<template>
  <footer class="footer">
    <div class="container level">
      <div class="level-left">
        <nuxt-link
          :to="{ name: 'index', params: {} }"">
          <img
            class="footer-icon"
            src="~/assets/images/dcf-logo.svg">
        </nuxt-link>
         @ 2018 DCF. All rights reserved
      </div>

      <div class="level-right">
        Back to the top
        <span class="footer-back-icon icon is-medium">
          <i class="mdi mdi-chevron-up" />
        </span>
      </div>
    </div>
  </footer>
</template>

<script>

export default {
  name: 'Footer',
  data () {
    return {
      //
    }
  },
  methods: {
    //
  }
}
</script>
