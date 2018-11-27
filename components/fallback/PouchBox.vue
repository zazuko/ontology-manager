<template>
  <article class="tile is-child class-box">
    <!-- TODO: add 'Last update' -->
    <!-- cf. https://imgur.com/a/37ucgoS -->
    <img
      src="~/assets/images/ic-document-white.svg"
      alt="Pouch icon"
      title="Pouch icon">
    <p class="title">
      <nuxt-link
        v-if="to.name || to.path"
        :to="to">
        {{ label }}
      </nuxt-link>
      <span
        v-else>
        {{ label }}
      </span>
    </p>
    <p class="subtitle">
      Propert{{ properties.length === 1 ? 'y' : 'ies' }}
      <br>
      {{ properties.length }}
    </p>
  </article>
</template>

<script>
export default {
  name: 'PouchBox',
  props: {
    label: {
      type: String,
      required: true
    },
    to: {
      type: Object,
      required: false,
      default: null
    },
    properties: {
      type: [Array, Object],
      required: true
    }
  }
}
</script>
