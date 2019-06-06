<template>
  <div class="has-secondary-background">
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
    import('@/assets/scss/dcf-style.scss')
  },
  mounted () {
    if (window.Cypress) {
      window.appReady = true
    }
  }
}
</script>
