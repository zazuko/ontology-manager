<template>
  <footer class="footer">
    <div class="container">
      <div class="media">
        <figure class="media-left is-hidden-touch">
          <nuxt-link
            :to="{ name: 'index', params: {} }">
            <img
              class="footer-icon image"
              :src="$store.state.config.editor.logoUrl">
          </nuxt-link>
        </figure>
        <div class="media-content">
          <div class="level">
            <div class="level-left">
              <div class="level-item">
                <div>
                  <p>
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
                  <p>
                    © {{ (new Date()).getFullYear() }} {{ $store.state.config.editor.meta.customerName }}. All rights reserved.
                  </p>
                </div>
              </div>
            </div>

            <div class="level-right has-text-right">
              <div class="level-item">
                <div>
                  <p>
                    <a
                      href="#"
                      @click="toPageTop">
                      Back to the top
                      <span class="footer-back-icon icon is-medium">
                        <chevron-up />
                      </span>
                    </a>
                    <nuxt-link :to="{ name: 'support' }">
                      Support
                      <span class="footer-back-icon icon is-medium">
                        <lifebuoy />
                      </span>
                    </nuxt-link>
                  </p>
                  <p>
                    <a
                      href="https://github.com/zazuko/ontology-manager"
                      target="_blank">
                      Zazuko Ontology Manager v{{ version }}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import RssBox from 'vue-material-design-icons/RssBox.vue'
import ChevronUp from 'vue-material-design-icons/ChevronUp.vue'
import Lifebuoy from 'vue-material-design-icons/Lifebuoy.vue'
import { version } from '@/package.json'

export default {
  name: 'PageFooter',
  components: {
    RssBox,
    ChevronUp,
    Lifebuoy
  },
  data () {
    return {
      version
    }
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
