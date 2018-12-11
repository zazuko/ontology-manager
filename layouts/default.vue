<template>
  <div>
    <top-nav />
    <nuxt />
    <Footer />
  </div>
</template>

<script>
import TopNav from '@/components/layout/TopNav.vue'
import Footer from '@/components/layout/Footer.vue'

export default {
  components: {
    TopNav,
    Footer
  },
  methods: {}
}
</script>
