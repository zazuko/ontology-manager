<template>
  <div>
    <section class="section">
      <div
        v-if="obj"
        class="container">
        <div class="columns">
          <div class="column is-3" />
          <div class="column">
            <h1 class="title">
              New {{ type }} Request<span
                v-show="obj.label">:
              "{{ obj.label }}"
              </span>
            </h1>
            <h2 class="subtitle">
              On <code>{{ obj.parentStructureIRI }}</code>
            </h2>
          </div>
        </div>

        <div class="columns">
          <div
            sticky-container
            class="column is-3">
            <progression-box
              :proposal-path="path" />
          </div>
          <div class="column">
            <div class="level topic-box">
              <div class="level-left">
                <figure class="level-item">
                  <p class="image is-64x64">
                    <img
                      :src="discussion.author.avatar"
                      :alt="authorsAvatar(discussion.author.name)">
                  </p>
                </figure>
                <div>
                  <p>
                    Submitted on {{ discussion.createdAt | formatDate }}
                  </p>
                  <p>
                    by {{ discussion.author.name }}
                  </p>
                </div>
              </div>
              <vote
                :thread-id="discussion.id"
                class="level-right has-text-right" />
            </div>

            <div class="box">
              <div
                id="motivation"
                class="field">
                <label class="label">Motivation</label>
                <div class="columns">
                  <div class="column">
                    <div class="control">
                      <textarea
                        :disabled="disabled"
                        v-debounce
                        v-model.lazy="obj.motivation"
                        class="textarea"
                        placeholder="" />
                    </div>
                  </div>
                  <div class="column" />
                </div>
              </div>
            </div>

            <new-class-form
              v-if="type === 'Class'"
              :disabled="disabled"
              :iri="obj.parentStructureIRI" />
            <new-property-form
              v-else-if="type === 'Property'"
              :disabled="disabled"
              :iri="obj.parentStructureIRI">

              <div
                v-show="!disabled"
                class="field is-grouped proposal-submit">
                <p class="control">
                  <button
                    id="submit"
                    class="button is-primary is-medium">
                    Submit Proposal
                  </button>
                </p>
                <p class="control">
                  <button
                    class="button is-medium">
                    Cancel
                  </button>
                </p>
              </div>

            </new-property-form>
            <div v-else />

          </div>

        </div>
      </div>
      <div
        v-else
        class="modal is-active">
        <div class="modal-background" />
        <div class="modal-content has-text-centered">
          <div class="box">
            <div class="lds-roller"><div /><div /><div /><div /><div /><div /><div /><div /></div>
            <p class="subtitle">Loading Proposal</p>
          </div>
        </div>
      </div>

    </section>

    <section class="section">
      <div class="container">
        <h1
          id="conversation"
          class="title">
          Conversation
        </h1>
        <div class="box">
          <discussion-card
            :discussion="discussion" />
          <discussion-reply
            :id="id"
            @answerAdded="answerAdded()" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import DiscussionCard from '@/components/discussion/DiscussionCard.vue'
import DiscussionReply from '@/components/discussion/DiscussionReply.vue'
import NewClassForm from '@/components/proposal/NewClassForm'
import NewPropertyForm from '@/components/proposal/NewPropertyForm'
import ProgressionBox from '@/components/proposal/ProgressionBox'
import Vote from '@/components/proposal/Vote'

import discussionById from '@/apollo/queries/discussionById'
import { LOAD } from '@/store/action-types'
import { toastClose } from '@/libs/utils'
import { proposalType } from '@/libs/proposals'
import { emptyDiscussion } from '@/libs/fixtures'

const {
  mapActions: propertyActions
} = createNamespacedHelpers('prop')
const {
  mapActions: classActions
} = createNamespacedHelpers('class')

export default {
  async asyncData ({ route }) {
    const id = parseInt(route.params.id, 10)

    return {
      id
    }
  },
  components: {
    NewClassForm,
    NewPropertyForm,
    ProgressionBox,
    DiscussionCard,
    DiscussionReply,
    Vote
  },
  data () {
    return {
      disabled: true,
      type: '',
      path: '',
      discussion: emptyDiscussion
    }
  },
  computed: {
    obj () {
      if (!this.path) {
        return false
      }
      if (process.server) {
        return this.$store.state[this.path]
      }
      return this.$deepModel(this.path)
    }
  },
  methods: {
    proposalType,
    ...classActions({
      loadClass: LOAD
    }),
    ...propertyActions({
      loadProperty: LOAD
    }),
    authorsAvatar (name = '') {
      return `${name}'s avatar'`
    },
    answerAdded () {
      this.$apollo.queries.discussion.refetch()
        .then(() => {
          this.$toast.success('Answer successfully added!', toastClose)
        })
    },
    init () {
      this.type = proposalType(this.discussion.proposalObject)
      let loader
      if (this.type === 'Class') {
        loader = this.loadClass
        this.path = 'class.clss'
      }
      if (this.type === 'Property') {
        loader = this.loadProperty
        this.path = 'prop.prop'
      }
      if (typeof loader !== 'function') {
        return this.$router.app.error({
          statusCode: 404,
          message: 'Not found'
        })
      }
      loader(this.id)
        .then((isDraft) => {
          if (isDraft !== true) {
            this.disabled = true
          }
        })
    }
  },
  validate ({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
  },
  apollo: {
    discussion: {
      prefetch: true,
      query: discussionById,
      variables () {
        return {
          id: this.id || this.$route.params.id
        }
      },
      fetchPolicy: 'cache-and-network',
      result ({ data, loading }) {
        if (!loading && data) {
          if (!data.discussion) {
            return this.$router.app.error({
              statusCode: 404,
              message: 'Not found'
            })
          }
          if (data.discussion.threadType !== 'PROPOSAL') {
            this.$router.push({ name: 'discussion-id', params: { id: this.$route.params.id } })
          }
          this.init()
        }
      }
    }
  }
}
</script>
