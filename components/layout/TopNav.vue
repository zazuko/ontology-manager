<template>
  <nav class="navbar top-nav">
    <div class="container">
      <div class="navbar-brand">
        <nuxt-link
          :to="{ name: 'index', params: {} }"
          class="navbar-item">
          <img src="~/assets/images/dcf-logo.svg">
        </nuxt-link>
        <div
          :class="{'is-active': isActive}"
          class="navbar-burger burger"
          data-target="top-nav"
          @click.prevent="toggle()">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div
        id="top-nav"
        :class="{'is-active': isActive}"
        class="navbar-menu">
        <div class="navbar-start">
          <nuxt-link
            :to="{ name: 'index', params: {} }"
            class="navbar-item">
            Home
          </nuxt-link>
          <draft-tab class="navbar-item" />
          <nuxt-link
            :to="{ name: 'admin-proposals', params: {} }"
            class="navbar-item">
            Admin
          </nuxt-link>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="navbar-item has-dropdown is-active">
              <div class="field">
                <p class="control has-icons-left">
                  <input
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
                class="navbar-dropdown">
                <a
                  v-for="(item, index) in ratings"
                  :key="index"
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
                </a>
              </div>
            </div>
          </div>
          <div class="navbar-item">
            <div class="field is-grouped">
              <sign-in @loggedOut="loggedOut" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { toastClose } from '@/libs/utils'
import { findBestMatch } from '@/libs/string-similarity'
import SignIn from './SignIn.vue'
import DraftTab from './DraftTab.vue'

export default {
  name: 'TopNav',
  components: {
    SignIn,
    DraftTab
  },
  data () {
    return {
      isActive: false,
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
    loggedOut () {
      this.$toast.success('Signed out successfully!', toastClose)
    },
    toggle () {
      this.isActive = !this.isActive
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
            if (object.type === 'label') {
              found.target = object.text
              found.details = object.objectType
            }
            else if (object.type === 'comment') {
              const match = found.target
              found.target = found.objects[0].part
              found.details = highlight(str, match)
            }
            else {
              console.log(found)
            }
          }
          return acc
        }, {})

      this.ratings = Object.values(ratings).slice(0, 10)
    }
  }
}

function highlight (word, sentence) {
  const xs = []
  const submatch = findBestMatch(word, sentence.split(' '))
  if (submatch.bestMatchIndex > 0) {
    xs.push({
      text: submatch.ratings.slice(0, submatch.bestMatchIndex).map(p => p.target).join(' '),
      highlight: false
    })
  }
  xs.push({
    text: submatch.ratings[submatch.bestMatchIndex].target,
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
