<template>
  <div class="tabs is-boxed is-large">
    <ul>
      <li
        :class="{ 'is-active': $router.currentRoute.name === 'admin-proposal'}">
        <nuxt-link :to="{ name: 'admin-proposal' }">
          Proposals
        </nuxt-link>
      </li>
      <li
        :class="{ 'is-active': $router.currentRoute.name === 'admin-discussion'}">
        <nuxt-link :to="{ name: 'admin-discussion' }">
          Discussions
        </nuxt-link>
      </li>
      <li
        :class="{ 'is-active': $router.currentRoute.name === 'admin-users'}">
        <nuxt-link :to="{ name: 'admin-users' }">
          Users
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {}
</script>
