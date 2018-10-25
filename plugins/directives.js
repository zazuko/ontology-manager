import Vue from 'vue'
import { debounce } from '@/libs/utils'
// https://github.com/vuejs-tips/v-debounce

Vue.directive('debounce', (el, binding) => {
  const defaultDelay = 330
  const delay = parseInt(binding.value || defaultDelay, 10)
  el.oninput = debounce((evt) => {
    // console.log('debounced by', defaultDelay)
    el.dispatchEvent(new Event('change'))
  }, delay)
})
