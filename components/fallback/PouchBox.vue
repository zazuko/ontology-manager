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
    <div class="level">
      <div class="level-left">
        <p class="subtitle">
          Logistics Object{{ classesCount === 1 ? '' : 's' }}
          <br>
          {{ classesCount }}
        </p>
      </div>
      <div class="level-right">
        <p class="subtitle">
          Propert{{ propertiesCount === 1 ? 'y' : 'ies' }}
          <br>
          {{ propertiesCount }}
        </p>
      </div>
    </div>
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
    propertiesCount: {
      type: Number,
      required: true
    },
    classesCount: {
      type: Number,
      required: false,
      default: 0
    }
  }
}
</script>
