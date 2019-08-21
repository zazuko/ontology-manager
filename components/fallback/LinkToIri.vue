<template>
  <span>
    <nuxt-link
      v-if="path"
      :to="{ path: path + (anchor ? `#${anchor}` : ''), params: {} }"
      :class="classes">
      {{ $getTerm(term) }}
    </nuxt-link>
    <a
      v-else
      :href="url"
      :class="classes">
      {{ $getTerm(term) }}
      <span
        class="icon is-small"
        title="Outgoing link will open in new tab">
        <open-in-new />
      </span>
    </a>
  </span>
</template>

<script>
import OpenInNew from 'vue-material-design-icons/OpenInNew.vue'

export default {
  name: 'LinkToIri',
  components: {
    OpenInNew
  },
  props: {
    term: {
      type: Object,
      required: true
    },
    anchor: {
      type: String,
      required: false,
      default: ''
    },
    linkClass: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  data () {
    let path = ''
    let url = ''
    const rebased = this.$rebaseIRI(this.term.value, 'relative')
    if (rebased.startsWith('/')) {
      path = rebased
    }
    else {
      url = rebased
    }
    return {
      path,
      url
    }
  },
  computed: {
    classes () {
      return Object.entries(this.linkClass)
        .filter(([key, val]) => val)
        .map(([key, val]) => key)
    }
  }
}
</script>
