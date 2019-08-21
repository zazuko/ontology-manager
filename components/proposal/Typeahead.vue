<!--
consider replacing this with:
https://github.com/buefy/buefy/blob/dev/src/components/autocomplete/Autocomplete.vue
which seems much more robust
-->
<template>
  <div class="configurable-list">
    <div class="field">
      <label
        v-if="label"
        class="label">
        {{ label }}
      </label>
      <p
        v-show="!readonly"
        class="control has-icons-left">
        <input
          v-model="inputString"
          autocomplete="new-password"
          type="text"
          class="input"
          @blur="unfocus"
          @focus="focus">
        <span class="icon is-small is-left">
          <magnify />
        </span>
      </p>
      <div
        class="dropdown"
        :class="{'is-active': showDropdown}">
        <div
          class="dropdown-menu">
          <div class="dropdown-content">
            <slot
              :inputString="inputString"
              :hide="clear"
              name="custom-options" />
            <div
              v-show="searchResults.length === 0"
              class="dropdown-item no-result">
              <em>No result</em>
            </div>
            <div
              v-for="option in searchResults"
              :key="option.key"
              class="dropdown-item result-item">
              <a
                href="#"
                @click.prevent="selection(option)">{{ option.label }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <slot name="selected-list" />
  </div>
</template>

<script>
import Magnify from 'vue-material-design-icons/Magnify.vue'

export default {
  name: 'Typeahead',
  components: {
    Magnify
  },
  props: {
    searchFunction: {
      type: Function,
      required: true
    },
    label: {
      type: String,
      required: false,
      default: ''
    },
    limit: {
      type: Number,
      required: false,
      default: 5
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false
    },
    minLength: {
      type: Number,
      required: false,
      default: 2
    }
  },
  data () {
    return {
      hasFocus: false,
      inputString: '',
      searchResults: []
    }
  },
  computed: {
    showDropdown () {
      const inputLength = this.inputString.length
      const inputLongEnough = inputLength >= this.minLength
      return inputLongEnough || (inputLongEnough && this.hasFocus)
    }
  },
  watch: {
    inputString: 'doSearch'
  },
  methods: {
    doSearch () {
      this.searchResults = this.searchFunction(this.inputString).slice(0, this.limit)
    },
    unfocus () {
      // Suggested entries are out of the input, so clicking on them triggers
      // the `blur` event. This timeout allows clicks on suggested entries to
      // be taken into account right before hiding the entries.
      setTimeout(() => {
        this.hasFocus = false
      }, 1000)
    },
    focus () {
      this.hasFocus = true
    },
    clear () {
      this.inputString = ''
      this.hasFocus = false
    },
    selection (option) {
      this.clear()
      this.$emit('selectionChanged', option)
    }
  }
}
</script>
