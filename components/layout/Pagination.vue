<template>
  <nav
    class="pagination"
    role="navigation"
    aria-label="pagination">
    <nuxt-link
      :to="{ name: route, query: { page: page - 1 } }"
      class="pagination-previous"
      :disabled="page && page === 1"
      aria-label="Go to previous page">
      Previous
    </nuxt-link>
    <nuxt-link
      :to="{ name: route, query: { page: page + 1 } }"
      class="pagination-next"
      :disabled="page && page === pagesCount"
      aria-label="Go to next page">
      Next page
    </nuxt-link>
    <ul class="pagination-list">
      <li
        v-for="p in range1"
        :key="p">
        <nuxt-link
          :to="{ name: route, query: { page: p } }"
          :class="{ 'is-current': page === p }"
          class="pagination-link"
          :aria-label="label(p)">
          {{ p }}
        </nuxt-link>
      </li>
      <!-- <li
        v-show="range2.length">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li
        v-for="p in range2"
        :key="p + 1000">
        <nuxt-link
          :to="{ name: route, query: { page: p } }"
          :class="{ 'is-current': page === p }"
          class="pagination-link"
          :aria-label="label(p)">
          {{ p }}
        </nuxt-link>
      </li>
      <li
        v-show="range3.length">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li
        v-for="p in range3"
        :key="p + 10000">
        <nuxt-link
          :to="{ name: route, query: { page: p } }"
          :class="{ 'is-current': page === p }"
          class="pagination-link"
          :aria-label="label(p)">
          {{ p }}
        </nuxt-link>
      </li> -->
    </ul>
  </nav>
</template>

<script>
import _range from 'lodash/range'

export default {
  name: 'Pagination',
  props: {
    page: {
      type: Number,
      required: true
    },
    resultsPerPage: {
      type: Number,
      required: true
    },
    resultsCount: {
      type: Number,
      required: true
    },
    route: {
      type: String,
      required: true
    }
  },
  computed: {
    pagesCount () {
      return Math.ceil(this.resultsCount / this.resultsPerPage)
    },
    range1 () {
      return _range(1, this.pagesCount + 1)
    }
  },
  methods: {
    label (p) {
      return `Go to page ${p}`
    }
  }
}

</script>
