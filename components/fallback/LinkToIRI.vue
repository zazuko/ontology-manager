<template>
  <span>
    <nuxt-link
      v-if="path"
      :to="{ path: path + (anchor ? `#${anchor}` : ''), params: {} }">
      {{ getTerm(term.value) }}
    </nuxt-link>
    <a
      v-else
      :href="url">
      {{ getTerm(term.value) }}
    </a>
  </span>
</template>

<script>
import { term, rebaseIRI } from '@/libs/rdf'

export default {
  name: 'LinkToIRI',
  props: {
    term: {
      type: Object,
      required: true
    },
    anchor: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    let path = ''
    let url = ''
    const rebased = rebaseIRI(this.term.value, 'relative')
    if (rebased.startsWith('/')) {
      path = rebased
    } else {
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
  }
}
</script>
