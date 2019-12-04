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
          v-model.lazy="searchString"
          @focus="showResult = true"
          @blur="hideResults">
        <span class="icon is-small is-left">
          <magnify />
        </span>
      </p>
    </div>

    <div
      v-show="showResult && results.length && searchString.length >= 2"
      class="navbar-dropdown search-results">
      <nuxt-link
        v-for="(item, index) in results"
        :key="index"
        :to="{ path: item.href }"
        @click="clear"
        class="navbar-item">
        <p class="result-title">
          {{ item.target }}
        </p>
        <p
          class="result-detail">
          <template v-if="item.details">
            {{ item.details }}
          </template>
          <template v-else>
            {{ item.highlight.before }}
            <strong>
              {{ item.highlight.highlighted }}
            </strong>
            {{ item.highlight.after }}
          </template>
        </p>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import Fuse from 'fuse.js'
import Magnify from 'vue-material-design-icons/Magnify.vue'

export default {
  name: 'Search',
  components: {
    Magnify
  },
  data () {
    return {
      results: [],
      searchString: '',
      showResult: false
    }
  },
  watch: {
    searchString () {
      this.search(this.searchString)
    },
    $route: {
      handler () {
        if (this.searchString || this.results.length) {
          this.clear()
        }
      },
      deep: true
    }
  },
  created () {
    const options = {
      keys: ['part', 'label', 'comment'],
      minMatchCharLength: 3,
      shouldSort: true,
      includeMatches: true,
      includeScore: true,
      distance: 10000,
      threshold: 0.05
    }
    this.fuse = new Fuse(this.$store.state.graph.searchIndex, options)
  },
  methods: {
    hideResults () {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => {
        this.showResult = false
      }, 100)
    },
    clear () {
      this.searchString = ''
      this.results = []
    },
    search (str) {
      const results = this.fuse.search(str)
        .filter(({ matches, score }) => matches && matches.length)
        .slice(0, 10)
        .map((result) => {
          const { item, matches } = result
          const href = this.$rebaseIRI(result.item.iri)
          const firstMatch = matches[0]
          const found = {
            href,
            target: item.label
          }

          if (firstMatch.key === 'comment') {
            found.highlight = highlight(item.comment, firstMatch.indices[0])
            if (!found.highlight.highlighted.toLocaleLowerCase().includes(str.toLowerCase())) {
              found.details = ''
              found.details += found.highlight.before + ' '
              found.details += found.highlight.highlighted + ' '
              found.details += found.highlight.after
            }
          }
          else {
            found.details = item.type
          }
          return found
        })
      this.results = results
    }
  }
}

function highlight (sentence, [from, to]) {
  const before = []
  const highlighted = []
  const after = []
  const lastSpace = sentence.lastIndexOf(' ')

  let lastSpaceIndex = 0
  let spaceIndex = -1
  while (lastSpaceIndex < from && spaceIndex < lastSpace) {
    spaceIndex = sentence.indexOf(' ', lastSpaceIndex + 1)
    if (spaceIndex < from) {
      before.push(sentence.substring(lastSpaceIndex, spaceIndex))
      lastSpaceIndex = spaceIndex + 1
    }
    else {
      break
    }
  }

  while (lastSpaceIndex < to && spaceIndex < lastSpace) {
    spaceIndex = sentence.indexOf(' ', lastSpaceIndex + 1)
    highlighted.push(sentence.substring(lastSpaceIndex, spaceIndex))
    lastSpaceIndex = spaceIndex + 1
  }

  while (spaceIndex < lastSpace) {
    spaceIndex = sentence.indexOf(' ', lastSpaceIndex + 1)
    after.push(sentence.substring(lastSpaceIndex, spaceIndex))
    lastSpaceIndex = spaceIndex + 1
  }
  after.push(sentence.substring(lastSpaceIndex))

  let trimmed = false
  while (before.join(' ').length + highlighted.join(' ').length + 1 >= 35) {
    before.shift()
    trimmed = true
  }

  if (trimmed) {
    before.unshift('… ')
  }

  return {
    before: before.join(' '),
    highlighted: highlighted.join(' '),
    after: after.join(' ')
  }
}
</script>
