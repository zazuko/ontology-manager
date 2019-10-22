<template>
  <div class="container layout-admin">
    <div class="layout-admin-header">
      <h1>Your Drafts</h1>
    </div>

    <draft-list
      :drafts="drafts"
      @discarded="loadDrafts()" />
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import DraftList from '@/components/proposal/DraftList'
import { LOAD } from '@/store/action-types'

const {
  mapActions: draftsActions,
  mapGetters: draftsGetters
} = createNamespacedHelpers('drafts')

export default {
  layout: 'default',
  components: {
    DraftList
  },
  computed: {
    ...draftsGetters(['drafts'])
  },
  methods: {
    ...draftsActions({
      loadDrafts: LOAD
    })
  },
  mounted () {
    this.loadDrafts()
  },
  head () {
    const h = {
      title: this.$headTitle('Your Drafted Proposals')
    }
    return h
  }
}
</script>
