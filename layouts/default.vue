<template>
  <div class="has-primary-background">
    <top-nav />
    <nuxt />
    <page-footer />
  </div>
</template>

<script>
import Auth from '@/mixins/auth'
import TopNav from '@/components/layout/TopNav'
import PageFooter from '@/components/layout/PageFooter'

export default {
  name: 'DefaultLayout',
  extends: Auth,
  components: {
    TopNav,
    PageFooter
  },
  methods: {},
  mounted () {
    if (window.Cypress && process.browser) {
      window.onNuxtReady(() => {
        window.appReady = true
      })
    }
  }
}
</script>
