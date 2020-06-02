<template>
  <div class="layout-admin-header">
    <h1>Admin Panel</h1>

    <nav class="layout-admin-nav">
      <ul>
        <li
          v-for="tab in tabs"
          :key="tab.route">
          <nuxt-link
            :to="{ name: tab.route }"
            :class="{ 'is-active': currentRoute === tab.route}">
            {{ tab.title }}
          </nuxt-link>
        </li>
        <li v-show="$store.state.auth.isSuperadmin">
          <nuxt-link
            :to="{ name: 'zom-admin-settings' }"
            :class="{ 'is-active': currentRoute === 'admin-settings'}">
            Ontology Manager Settings
          </nuxt-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import _get from 'lodash/get'

export default {
  name: 'AdminMenu',
  data () {
    const tabs = [
      { route: 'zom-admin-proposals', title: 'Proposals' },
      { route: 'zom-admin-discussions', title: 'Discussions' },
      { route: 'zom-admin-users', title: 'Users' },
      { route: 'zom-admin-hats', title: 'Hats' }
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
