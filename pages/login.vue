<template>
  <section class="container">
    Signing you in…
  </section>
</template>

<script>
export default {
  layout (context) {
    return `default-${context.app.$env.EDITOR_STYLE}`
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
