<template>
  <div class="container">
    <section class="section">
      <draft-list
        :drafts="drafts"
        @discarded="loadDrafts()" />
    </section>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import DraftList from '@/components/proposal/DraftList.vue'
import { LOAD } from '@/store/action-types'
import { headTitle } from '@/libs/utils'

const {
  mapActions: draftsActions,
  mapGetters: draftsGetters
} = createNamespacedHelpers('drafts')

export default {
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
      title: headTitle('Your Drafted Proposals')
    }
    return h
  }
}
</script>
