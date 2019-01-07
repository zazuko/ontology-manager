<template>
  <article
    :id="iriToId(iri)"
    class="tile is-child class-box">
    <nuxt-link :to="(to.name || to.path) ? to : ''">
      <span
        v-show="isProposal"
        class="class-box-toast">
        Proposal
      </span>
      <p class="class-box-update">
        Last updated:
        <span v-if="modified">
          {{ (new Date(modified)) | formatDate }}
        </span>
        <span v-else>&mdash;</span>
      </p>
      <img
        v-show="type === 'container'"
        src="~/assets/images/ic-pouch.svg"
        alt="Pouch icon"
        title="Pouch icon"
        class="class-box-icon">
      <img
        v-show="type === 'class'"
        src="~/assets/images/ic-class.svg"
        alt="Class icon"
        title="Class icon"
        class="class-box-icon">
      <p class="class-box-title">
        {{ label }}
      </p>
      <div class="class-box-level">
        <div
          v-show="type === 'container'"
          class="class-box-level-item">
          <span class="class-box-label">
            Logistics Object{{ classesCount === 1 ? '' : 's' }}
          </span>
          <span class="class-box-value">
            {{ classesCount }}
          </span>
        </div>
        <div class="class-box-level-item">
          <span class="class-box-label">
            Propert{{ propertiesCount === 1 ? 'y' : 'ies' }}
          </span>
          <span class="class-box-value">
            {{ propertiesCount }}
          </span>
        </div>
      </div>
    </nuxt-link>
  </article>
</template>

<script>
import { iriToId } from '@/libs/utils'

export default {
  name: 'PouchBox',
  props: {
    label: {
      type: String,
      required: true
    },
    to: {
      type: Object,
      required: false,
      default: null
    },
    propertiesCount: {
      type: Number,
      required: true
    },
    iri: {
      type: String,
      required: true
    },
    classesCount: {
      type: Number,
      required: false,
      default: 0
    },
    modified: {
      type: String,
      required: false,
      default: ''
    },
    type: {
      type: String,
      required: false,
      default: ''
    },
    isProposal: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    iriToId
  }
}
</script>
