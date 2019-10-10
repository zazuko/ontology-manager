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
              <rss-box />
            </span>
          </a>
          <a href="/rss.xml">
            rss
            <span class="icon">
              <rss-box />
            </span>
          </a>
        </p>
      </div>

      <div class="level-right">
        <p>
          <a
            href="#"
            @click="toPageTop">
            Back to the top
            <span class="footer-back-icon icon is-medium">
              <chevron-up />
            </span>
          </a>
          <br>
          <nuxt-link :to="{ name: 'support' }">
            Support
            <span class="footer-back-icon icon is-medium">
              <lifebuoy />
            </span>
          </nuxt-link>
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
import RssBox from 'vue-material-design-icons/RssBox.vue'
import ChevronUp from 'vue-material-design-icons/ChevronUp.vue'
import Lifebuoy from 'vue-material-design-icons/Lifebuoy.vue'

export default {
  name: 'PageFooter',
  components: {
    RssBox,
    ChevronUp,
    Lifebuoy
  },
  methods: {
    toPageTop (event) {
      event.preventDefault()

      window.scroll({
        top: 0,
        behavior: 'smooth'
      })
    }
  }
}
</script>
