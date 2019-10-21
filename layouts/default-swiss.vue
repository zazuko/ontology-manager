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
  beforeCreate () {
    import('@/assets/scss/swiss-style.scss')
  },
  mounted () {
    if (window.Cypress) {
      window.appReady = true
    }
  }
}
</script>
