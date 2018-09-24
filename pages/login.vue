<template>
  <section class="container">
    Signing you in…
  </section>
</template>

<script>
import { datasetsSetup } from '~/libs/utils'

export default {
  async created () {
    await datasetsSetup(this.$store)
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
