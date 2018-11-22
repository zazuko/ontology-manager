<template>
  <nav class="tabs is-boxed is-large">
    <ul>
      <li
        v-for="tab in tabs"
        :key="tab.route"
        :class="{ 'is-active': currentRoute === tab.route}">
        <nuxt-link :to="{ name: tab.route }">
          {{ tab.title }}
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import _get from 'lodash/get'

export default {
  name: 'AdminMenu',
  data () {
    const tabs = [
      { route: 'admin-proposals', title: 'Proposals' },
      { route: 'admin-discussions', title: 'Discussions' },
      { route: 'admin-users', title: 'Users' },
      { route: 'admin-hats', title: 'Hats' }
    ]
    return {
      tabs
    }
  },
  computed: {
    currentRoute () {
      return _get(this, '$router.currentRoute.name', '')
    }
  }
}
</script>
