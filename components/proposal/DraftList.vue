<template>
  <div>
    <table
      v-if="drafts.length"
      class="table admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Last updated</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="draft in drafts"
          :key="draft.id">
          <td>
            <p>{{ draft.headline }}</p>
          </td>
          <td>
            <p>{{ draft.updatedAt | formatTime }}</p>
          </td>
          <td class="draft-actions">
            <nuxt-link
              v-if="$proposalType(draft.proposalObject) === 'Class'"
              :to="{ name: 'proposal-class', query: { id: draft.id } }"
              class="edit-draft">
              Edit Proposal
            </nuxt-link>
            <nuxt-link
              v-else
              :to="{ name: 'proposal-property', query: { id: draft.id } }"
              class="edit-draft">
              Edit Proposal
            </nuxt-link>
            <button
              @click.prevent="discard(draft.id)"
              class="discard-draft">
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

export default {
  name: 'DraftList',
  props: ['drafts'],
  methods: {
    async discard (threadId) {
      const variables = { threadId }
      try {
        await this.$apollo.mutate({ mutation, variables })
        this.$emit('discarded', threadId)
      }
      catch (err) {
        console.error(err)
        this.$sentry.captureException(err)
      }
    }
  }
}
</script>
