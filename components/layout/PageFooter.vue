<template>
  <footer class="footer">
    <div class="container level">
      <div class="level-left">
        <nuxt-link :to="{ name: 'index', params: {} }">
          <img
            class="footer-icon"
            :src="logoUrl">
        </nuxt-link>
        <span>© {{ year }} {{ customer }}. All rights reserved</span>
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
export default {
  name: 'PageFooter',
  data () {
    return {
      customer: this.$store.state.config.editor.customerName,
      logoUrl: this.$store.state.config.editor.logoUrl,
      year: (new Date()).getFullYear()
    }
  }
}
</script>
