<template>
  <nav
    class="pagination"
    role="navigation"
    aria-label="pagination">
    <nuxt-link
      :to="{ name: 'admin-proposals', query: { page: page - 1 } }"
      class="pagination-previous"
      v-show="page && page !== 1"
      aria-label="Goto previous page">
      Previous
    </nuxt-link>
    <nuxt-link
      :to="{ name: 'admin-proposals', query: { page: page + 1 } }"
      class="pagination-next"
      v-show="!isLastPage"
      aria-label="Goto next page">
      Next page
    </nuxt-link>
    <ul class="pagination-list">
      <li
        v-for="p in range1"
        :key="p">
        <nuxt-link
          :to="{ name: 'admin-proposals', query: { page: p } }"
          :class="{ 'is-current': page === p }"
          class="pagination-link"
          :aria-label="label(p)">
          {{ p }}
        </nuxt-link>
      </li>
      <li
        v-show="range2.length">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li
        v-for="p in range2"
        :key="p + 1000">
        <nuxt-link
          :to="{ name: 'admin-proposals', query: { page: p } }"
          :class="{ 'is-current': page === p }"
          class="pagination-link"
          :aria-label="label(p)">
          {{ p }}
        </nuxt-link>
      </li>
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
    isLastPage: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    range1 () {
      const range = [1]
      for (let i = 2; i <= this.page && range.length < 4; i++) {
        range.push(i)
      }
      if (this.page >= 5) {
        return range.slice(0, 2)
      }
      return range
    },
    range2 () {
      const n = this.page
      let firstPage = n > 4 ? Math.max(n - 4, 4) : n
      const range = _range(firstPage, n + 1)
      if (range.length < 2) {
        return []
      }
      return range
    }
  },
  methods: {
    label (p) {
      return `Goto page ${p}`
    }
  }
}

</script>
