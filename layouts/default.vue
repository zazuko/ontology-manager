<template>
  <div class="has-primary-background">
    <top-nav />
    <nuxt />
    <page-footer />
  </div>
</template>

<script>
import TopNav from '@/components/layout/TopNav'
import PageFooter from '@/components/layout/PageFooter'

export default {
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
