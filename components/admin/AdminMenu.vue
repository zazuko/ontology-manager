<template>
  <nav class="tabs is-boxed is-large">
    <ul>
      <li
        :class="{ 'is-active': currentRoute === 'admin-proposals'}">
        <nuxt-link :to="{ name: 'admin-proposals' }">
          Proposals
        </nuxt-link>
      </li>
      <li
        :class="{ 'is-active': currentRoute === 'admin-discussions'}">
        <nuxt-link :to="{ name: 'admin-discussions' }">
          Discussions
        </nuxt-link>
      </li>
      <li
        :class="{ 'is-active': currentRoute === 'admin-users'}">
        <nuxt-link :to="{ name: 'admin-users' }">
          Users
        </nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import _get from 'lodash/get'

export default {
  name: 'AdminMenu',
  computed: {
    currentRoute () {
      return _get(this, '$router.currentRoute.name', '')
    }
  }
}
</script>
