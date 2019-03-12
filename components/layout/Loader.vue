<template>
  <div
    v-show="show"
    class="modal is-active modal-loader">
    <div class="modal-background" />
    <div class="modal-content has-text-centered">
      <div class="box">
        <div class="lds-roller"><div /><div /><div /><div /><div /><div /><div /><div /></div>
        <slot>
          <p class="subtitle">Loading Data</p>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loader',
  props: {
    showIf: {
      type: [Boolean, Function],
      required: true
    }
  },
  computed: {
    show () {
      if (typeof this.showIf === 'function') {
        return this.showIf()
      }
      return this.showIf
    }
  }
}
</script>
