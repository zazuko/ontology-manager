<template>
  <div>
    <table
      v-if="drafts.length"
      class="table is-bordered is-striped is-narrow is-fullwidth">
      <thead>
        <tr>
          <th>title</th>
          <th>on</th>
          <th>last updated</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="draft in drafts"
          :key="draft.id">
          <td>{{ draft.headline }}</td>
          <td>{{ draft.iri }}</td>
          <td>{{ draft.updatedAt | formatTime }}</td>
          <td>
            <nuxt-link
              v-if="proposalType(draft.proposalObject) === 'Class'"
              :to="{ name: 'proposal-new-class', query: { id: draft.id } }"
              class="button is-small is-info">
              Edit Proposal
            </nuxt-link>
            <nuxt-link
              v-else
              :to="{ name: 'proposal-new-property', query: { id: draft.id } }"
              class="button is-small is-info">
              Edit Proposal
            </nuxt-link>
            <button
              @click="discard(draft.id)"
              class="button is-small is-danger">
              Discard
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>
      You don't have any proposal drafts yet. Go create a proposal!
    </p>
  </div>
</template>

<script>
import mutation from '@/apollo/mutations/discardDraft'
import { proposalType } from '@/libs/proposals'
export default {
  name: 'DraftList',
  props: ['drafts'],
  methods: {
    proposalType,
    async discard (threadId) {
      const variables = { threadId }
      try {
        await this.$apollo.mutate({ mutation, variables })
        this.$emit('discarded', threadId)
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>
