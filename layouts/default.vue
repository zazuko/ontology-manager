<template>
  <div class="has-primary-background">
    <top-nav />
    <nuxt />
    <page-footer />
  </div>
</template>

<script>
import TopNav from '@/components/layout/TopNav.vue'
import PageFooter from '@/components/layout/PageFooter.vue'

export default {
  components: {
    TopNav,
    PageFooter
  },
  methods: {}
}
</script>
