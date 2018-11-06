<template>
  <table class="table is-bordered is-striped is-narrow is-fullwidth">
    <thead>
      <tr>
        <th>title</th>
        <th>on</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="draft in drafts.drafts"
        :key="draft.id">
        <td>{{ draft.headline }}</td>
        <td>{{ draft.iri }}</td>
        <td>
          <nuxt-link
            v-if="proposalType(draft.proposalObject) === 'Class'"
            :to="{ name: 'proposal-new-class', query: { id: draft.id } }"
            class="button is-small is-info">
            Edit Proposal
          </nuxt-link>
          <nuxt-link
            v-if="proposalType(draft.proposalObject) === 'Property'"
            :to="{ name: 'proposal-new-property', query: { id: draft.id } }"
            class="button is-small is-info">
            Edit Proposal
          </nuxt-link>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { proposalType } from '@/libs/proposals'

export default {
  name: 'DraftList',
  props: ['drafts'],
  methods: {
    proposalType
  }
}
</script>
