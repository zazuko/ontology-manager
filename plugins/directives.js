import Vue from 'vue'

// https://github.com/vuejs-tips/v-debounce
function debounce (fn, delay) {
  let timeoutID
  return function () {
    clearTimeout(timeoutID)
    const args = arguments
    timeoutID = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

Vue.directive('debounce', (el, binding) => {
  const defaultDelay = 150
  const delay = parseInt(binding.value || defaultDelay, 10)
  el.oninput = debounce((evt) => {
    el.dispatchEvent(new Event('change'))
  }, delay)
})
