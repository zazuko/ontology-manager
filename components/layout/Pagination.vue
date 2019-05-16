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
        v-for="p in paginate[0]"
        :key="p">
        <nuxt-link
          :to="{ name: route, query: { page: p } }"
          :class="{ 'is-current': page === p }"
          class="pagination-link"
          :aria-label="label(p)">
          {{ p }}
        </nuxt-link>
      </li>
      <li
        v-show="paginate[1].length">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li
        v-for="p in paginate[1]"
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
        v-show="paginate[2].length">
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li
        v-for="p in paginate[2]"
        :key="p + 10000">
        <nuxt-link
          :to="{ name: route, query: { page: p } }"
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
    paginate () {
      const current = this.page
      const max = this.pagesCount
      const pages = [1, current - 1, current, current + 1, max]
        // clamp to range 1 - max
        .filter(page => page > 0 && page <= max)

      // split into blocks
      const blocks = Array.from(new Set(pages))
        .reduce((blocks, page) => {
          const currentBlock = blocks.slice(-1)[0]

          if (currentBlock && currentBlock.slice(-1)[0] === page - 1) {
            currentBlock.push(page)
          }
          else {
            blocks.push([page])
          }

          return blocks
        }, [])

      if (blocks.length === 3) {
        return blocks
      }

      const [block1, block3 = []] = blocks
      return [block1, [], block3]
    }
  },
  methods: {
    label (p) {
      return `Go to page ${p}`
    }
  }
}

</script>
