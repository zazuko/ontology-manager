<template>
  <div class="configurable-list">
    <div class="field">
      <label
        v-if="label"
        class="label">
        {{label}}
      </label>
      <input
        v-model="inputString"
        autocomplete="new-password"
        type="text"
        class="input"
        @blur="unfocus"
        @focus="focus">
      <div
        class="dropdown"
        :class="{'is-active': hasFocus && inputString.length >= minLength}">
        <div
          class="dropdown-menu">
          <div class="dropdown-content">
            <slot
              :inputString="inputString"
              :unfocus="unfocus"
              name="custom-options" />
            <hr class="dropdown-divider">
            <div
              v-for="option in searchFunction(inputString).slice(0, limit)"
              :key="option.key"
              class="dropdown-item">
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
export default {
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
    minLength: {
      type: Number,
      required: false,
      default: 2
    }
  },
  data () {
    return {
      hasFocus: false,
      inputString: ''
    }
  },
  methods: {
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
    selection (option) {
      this.inputString = ''
      this.hasFocus = false

      this.$emit('selectionChanged', option)
    },
    rand () {
      return String(Date.now())
    }
  }
}
</script>
