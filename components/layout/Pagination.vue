<template>
  <nav
    class="pagination"
    role="navigation"
    aria-label="pagination">
    <a class="pagination-previous">Previous</a>
    <a class="pagination-next">Next page</a>
    <ul class="pagination-list">
      <li>
        <a
          class="pagination-link"
          aria-label="Goto page 1">1</a>
      </li>
      <li>
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li>
        <a
          class="pagination-link"
          aria-label="Goto page 45">45</a>
      </li>
      <li>
        <a
          class="pagination-link is-current"
          aria-label="Page 46"
          aria-current="page">46</a>
      </li>
      <li>
        <a
          class="pagination-link"
          aria-label="Goto page 47">47</a>
      </li>
      <li>
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li>
        <a
          class="pagination-link"
          aria-label="Goto page 86">86</a>
      </li>
    </ul>
  </nav>
</template>

<script>
import { findBestMatch } from '@/libs/string-similarity'
import { rebaseIRI } from '@/libs/rdf'

export default {
  name: 'Pagination',
  data () {
    return {
      ratings: [],
      searchString: '',
      searchIndex: this.$store.state.graph.searchIndex,
      searchTexts: this.$store.state.graph.searchIndex.map(x => x.text)
    }
  },
  watch: {
    'searchString' () {
      this.search(this.searchString)
    }
  },
  methods: {
    clear () {
      this.searchString = ''
    },
    search (str) {
      let { ratings = [] } = findBestMatch(str, this.searchTexts)
      ratings.sort((a, b) => b.rating - a.rating)
      ratings = ratings
        .slice(0, 21)
        .filter(item => item.rating > 0.05)
        .reduce((acc, found) => {
          const object = this.searchIndex[found.index]
          if (!acc[object.iri]) {
            found.objects = this.searchIndex.filter(({ iri }) => iri === object.iri)
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
