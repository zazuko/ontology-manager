<template>
  <section class="container">
    <div class="tabs is-boxed is-large">
      <ul>
        <li class="is-active">
          <nuxt-link :to="{ name: 'admin-proposal' }">
            Proposals
          </nuxt-link>
        </li>
        <li>
          <nuxt-link :to="{ name: 'admin-discussion' }">
            Discussions
          </nuxt-link>
        </li>
      </ul>
    </div>

    <admin-discussion-list
      :discussions="discussions.nodes" />

  </section>
</template>

<script>
import allDiscussions from '@/apollo/queries/adminWorklist'
import AdminDiscussionList from '@/components/AdminDiscussionList.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  components: {
    AdminDiscussionList
  },
  data: () => ({
    discussions: {
      nodes: []
    }
  }),
  async created () {
    await datasetsSetup(this.$store)
  },
  apollo: {
    discussions: {
      prefetch: true,
      query: allDiscussions,
      variables () {
        return {
          threadType: 'PROPOSAL'
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
