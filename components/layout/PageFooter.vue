<template>
  <footer class="footer">
    <div class="container level">
      <div class="level-left">
        <nuxt-link :to="{ name: 'index', params: {} }">
          <img
            class="footer-icon"
            :src="$store.state.config.editor.logoUrl">
        </nuxt-link>
        <p>
          <span>© {{ (new Date()).getFullYear() }} {{ $store.state.config.editor.meta.customerName }}. All rights reserved</span>
          <br>
          Feeds:
          <nuxt-link :to="{ path: '/atom.xml', params: {} }">
            atom
            <span class="icon">
              <i class="mdi mdi-rss-box" />
            </span>
          </nuxt-link>
          <nuxt-link :to="{ path: '/rss.xml', params: {} }">
            rss
            <span class="icon">
              <i class="mdi mdi-rss-box" />
            </span>
          </nuxt-link>
        </p>
      </div>

      <div class="level-right">
        <p>
          <a href="#page-top">
            Back to the top
            <span class="footer-back-icon icon is-medium">
              <i class="mdi mdi-chevron-up" />
            </span>
          </a>
          <br>
          <nuxt-link :to="{ name: 'support' }">
            Support
            <span class="footer-back-icon icon is-medium">
              <i class="mdi mdi-lifebuoy" />
            </span>
          </nuxt-link>
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'PageFooter'
}
</script>
