<template lang="html">
  <a :href="id | forgeLink">
    <span
      class="icon is-small"
      :title="title">
      <i class="mdi mdi-open-in-new" />
    </span>
  </a>
</template>

<script>
export default {
  name: 'ForgeLink',
  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },
  computed: {
    title () {
      // TODO: make this forge-agnostic
      return 'See on GitHub'
    }
  }
}
</script>
