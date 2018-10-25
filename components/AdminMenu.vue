<template>
  <nav class="tabs is-boxed is-large">
    <ul>
      <li
        :class="{ 'is-active': currentRoute === 'admin-proposal'}">
        <nuxt-link :to="{ name: 'admin-proposal' }">
          Proposals
        </nuxt-link>
      </li>
      <li
        :class="{ 'is-active': currentRoute === 'admin-discussion'}">
        <nuxt-link :to="{ name: 'admin-discussion' }">
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
  computed: {
    currentRoute () {
      return _get(this, '$router.currentRoute.name', '')
    }
  }
}
</script>
