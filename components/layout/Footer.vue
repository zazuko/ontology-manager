<template>
  <footer class="footer">
    <div class="container level">
      <div class="level-left">
        <nuxt-link :to="{ name: 'index', params: {} }">
          <img
            class="footer-icon"
            src="~/assets/images/dcf-logo.svg">
        </nuxt-link>
        <!-- TODO: make it configurable -->
        © 2018 {{ customer }}. All rights reserved
      </div>

      <div class="level-right">
        <a href="#page-top">
          Back to the top
          <span class="footer-back-icon icon is-medium">
            <i class="mdi mdi-chevron-up" />
          </span>
        </a>
      </div>
    </div>
  </footer>
</template>

<script>
const customer = process.env.customer

export default {
  name: 'Footer',
  data () {
    return {
      customer
    }
  }
}
</script>
