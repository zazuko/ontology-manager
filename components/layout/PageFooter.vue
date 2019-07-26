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
          <a href="/atom.xml">
            atom
            <span class="icon">
              <i class="mdi mdi-rss-box" />
            </span>
          </a>
          <a href="/rss.xml">
            rss
            <span class="icon">
              <i class="mdi mdi-rss-box" />
            </span>
          </a>
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
