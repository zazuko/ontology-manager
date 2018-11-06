<template>
  <div class="container">
    <section class="section">
      <draft-list
        :drafts="proposals" />
    </section>
  </div>
</template>

<script>
import gql from 'graphql-tag'

import DraftList from '@/components/DraftList.vue'
import { datasetsSetup } from '@/libs/utils'

export default {
  components: {
    DraftList
  },
  data: () => ({
    personId: 0,
    proposals: {
      drafts: []
    }
  }),
  async created () {
    await datasetsSetup(this.$store)
  },
  mounted () {
    this.personId = this.$auth.$storage.getState('personId')
    this.$auth.$storage.watchState('personId', (personId) => {
      setTimeout(() => {
        this.personId = personId
      }, 100)
    })
  },
  apollo: {
    proposals: {
      prefetch: true,
      query: gql`
        query GetUserContent ($authorId: Int!) {
          proposals: allThreads (condition: {authorId: $authorId, threadType: PROPOSAL, isDraft: true}) {
            drafts: nodes {
              id,
              headline,
              iri,
              proposalObject
            }
          }
        }`,
      variables () {
        return {
          authorId: this.personId
        }
      },
      skip () {
        return !this.personId
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>
