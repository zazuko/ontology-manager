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
      <p
        v-show="modified"
        class="class-box-update">
        Last updated:
        <span v-if="modified">
          {{ (new Date(modified)) | formatDate }}
        </span>
        <span v-else>&mdash;</span>
      </p>
      <div
        v-show="type === 'container'"
        class="class-box-icon pouch" />
      <div
        v-show="type === 'class'"
        class="class-box-icon class" />
      <p class="class-box-title">
        <span class="ellipsis">
          <template v-if="type === 'container'">
            {{ label }}
          </template>
          <template v-else>
            {{ $getTerm(iri) || label }}
          </template>
        </span>
      </p>
      <div class="class-box-level">
        <div
          v-show="type === 'container'"
          class="class-box-level-item">
          <span class="class-box-label">
            Object{{ classesCount === 1 ? '' : 's' }}
          </span>
          <span class="class-box-value">
            {{ classesCount }}
          </span>
        </div>
        <client-only>
          <template v-if="!isProposal">
            <div
              v-for="key in Object.keys(proposalCount)"
              :key="key"
              v-show="proposalCount[key]"
              class="class-box-level-item">
              <span class="class-box-label">
                {{ proposalType[key] }} Proposal{{ proposalCount[key] === 1 ? '' : 's' }}
              </span>
              <span class="class-box-value">
                {{ proposalCount[key] }}
              </span>
            </div>
          </template>
        </client-only>
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
    iri: {
      type: String,
      required: true
    },
    classesCount: {
      type: Number,
      required: false,
      default: 0
    },
    proposalCount: {
      type: Object,
      required: false,
      default: () => {}
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
  },
  data () {
    return {
      proposalType: {
        newClass: 'New Class',
        newProperty: 'New Property',
        changeClass: 'Change Class',
        changeProperty: 'Change Property'
      }
    }
  }
}
</script>
