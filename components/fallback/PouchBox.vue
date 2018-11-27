<template>
  <article class="tile is-child class-box">
    <p class="class-box-update">
      Last updated:
      <span v-if="modified">
        {{ (new Date(modified)) | formatDate }}
      </span>
      <span v-else>&mdash;</span>
    </p>
    <img
      v-show="type === 'container'"
      src="~/assets/images/ic-pouch.svg"
      alt="Pouch icon"
      title="Pouch icon">
    <img
      v-show="type === 'class'"
      src="~/assets/images/ic-class.svg"
      alt="Class icon"
      title="Class icon">
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
    },
    modified: {
      type: String,
      required: false,
      default: ''
    },
    type: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>
