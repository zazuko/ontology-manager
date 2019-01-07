<template>
  <span>
    <nuxt-link
      v-if="path"
      :to="{ path: path + (anchor ? `#${anchor}` : ''), params: {} }"
      :class="classes">
      {{ getTerm(term.value) }}
    </nuxt-link>
    <a
      v-else
      :href="url"
      :class="classes">
      {{ getTerm(term.value) }}
      <span
        class="icon is-small"
        title="Outgoing link will open in new tab">
        <i class="mdi mdi-open-in-new" />
      </span>
    </a>
  </span>
</template>

<script>
import { term, rebaseIRI } from '@/libs/rdf'

export default {
  name: 'LinkToIri',
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
    const rebased = rebaseIRI(this.term.value, 'relative')
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
  methods: {
    getTerm: term,
    rebaseIRI
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
