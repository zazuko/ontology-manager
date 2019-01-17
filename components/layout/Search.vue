<template>
  <div>
    <div class="field">
      <p class="control has-icons-left">
        <input
          id="topbar-search"
          class="input"
          type="text"
          placeholder="Search"
          v-debounce="150"
          v-model.lazy="searchString">
        <span class="icon is-small is-left">
          <i class="mdi mdi-magnify"></i>
        </span>
      </p>
    </div>

    <div
      v-show="ratings.length"
      class="navbar-dropdown search-results">
      <nuxt-link
        v-for="(item, index) in ratings"
        :key="index"
        :to="{ path: item.href }"
        @click="clear"
        class="navbar-item">
        <p class="result-title">
          {{ item.target }}
        </p>
        <p
          v-if="Array.isArray(item.details)"
          class="result-detail">
          <span
            v-for="(detail, idx) in item.details"
            :key="idx">
            <strong v-if="detail.highlight">
              {{ detail.text }}
            </strong>
            <span v-else>
              {{ detail.text }}
            </span>
          </span>
        </p>
        <p
          v-else
          class="result-detail">
          {{ item.details }}
        </p>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import { findBestMatch } from '@/libs/string-similarity'
import { rebaseIRI } from '@/libs/rdf'

export default {
  name: 'Search',
  data () {
    return {
      ratings: [],
      searchString: ''
    }
  },
  watch: {
    'searchString' () {
      this.search(this.searchString)
    },
    '$route': {
      handler () {
        if (this.searchString || this.ratings.length) {
          this.clear()
        }
      },
      deep: true
    }
  },
  computed: {
    searchTexts () {
      return this.$store.state.graph.searchIndex.map(x => x.text || '')
    }
  },
  methods: {
    clear () {
      this.searchString = ''
      this.ratings = []
    },
    search (str) {
      if (str.length < 2) {
        return
      }
      let { ratings = [] } = findBestMatch(str, this.searchTexts)
      ratings.sort((a, b) => b.rating - a.rating)
      ratings = ratings
        .slice(0, 21)
        .filter(item => item.rating > 0.05)
        .reduce((acc, found) => {
          const object = this.$store.state.graph.searchIndex[found.index]
          if (!acc[object.iri]) {
            found.objects = this.$store.state.graph.searchIndex.filter(({ iri }) => iri === object.iri)
            acc[object.iri] = found
            found.href = rebaseIRI(object.iri)
            if (object.type === 'label') {
              found.target = object.text
              found.details = object.objectType
            }
            else {
              const match = found.target
              found.target = found.objects[0].part
              found.details = highlight(str, match)
            }
          }
          return acc
        }, {})

      this.ratings = Object.values(ratings).filter((rating) => !!rating.target).slice(0, 10)
    }
  }
}

function highlight (word, sentence) {
  const xs = []
  const submatch = findBestMatch(word, sentence.split(' '))
  const highlightedText = submatch.ratings[submatch.bestMatchIndex].target
  if (submatch.bestMatchIndex > 0) {
    let beforeHighlight = submatch.ratings.slice(0, submatch.bestMatchIndex).map(p => p.target).join(' ')
    let trimmed = false
    while (beforeHighlight.includes(' ') && (beforeHighlight.length + highlightedText.length) > 35) {
      beforeHighlight = beforeHighlight.substr(beforeHighlight.indexOf(' ') + 1)
      trimmed = true
    }
    xs.push({
      text: (trimmed ? '…' : '') + beforeHighlight,
      highlight: false
    })
  }
  xs.push({
    text: highlightedText,
    highlight: true
  })
  if (submatch.bestMatchIndex < submatch.ratings.length - 1) {
    xs.push({
      text: submatch.ratings.slice(submatch.bestMatchIndex + 1).map(p => p.target).join(' '),
      highlight: false
    })
  }
  return xs
}
</script>
