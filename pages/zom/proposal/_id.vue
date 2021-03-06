<template>
  <div>
    <div class="container layout-proposal">
      <section v-if="obj">
        <div class="columns">
          <div class="column is-3 layout-proposal-sidebar-gap" />
          <div class="column layout-proposal-header">
            <h1
              v-if="obj.isEdit"
              class="title is-1">
              Change {{ type }} Request: "{{ obj.label }}"
            </h1>
            <h1
              v-else
              class="title is-1">
              New {{ type }} Request: "{{ obj.label }}"
            </h1>
            <h2 class="subtitle is-1">
              On
              <nuxt-link
                :to="$rebaseIRI(obj.parentStructureIRI, 'relative')"
                class="title-url">
                {{ obj.parentStructureIRI }}
              </nuxt-link>
            </h2>
          </div>
        </div>

        <div class="columns">
          <div class="column is-3 is-hidden-mobile sticky-container">
            <progression-box
              :proposal-path="path" />
          </div>
          <div class="column">
            <div class="box">
              <div class="level topic-box">
                <div class="level-left">
                  <figure class="level-item">
                    <p class="image proposal-author-img">
                      <img
                        class="is-rounded"
                        :src="discussion.author.avatar"
                        :alt="authorsAvatar(discussion.author.name)">
                    </p>
                  </figure>
                  <div class="proposal-author-info">
                    <p>
                      Submitted on {{ discussion.createdAt | formatDate }}
                    </p>
                    <p>
                      by <span class="proposal-author-name">{{ discussion.author.name }}</span>
                    </p>
                  </div>
                </div>
                <vote
                  :thread-id="discussion.id"
                  class="level-right has-text-right" />
              </div>
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
                        :readonly="readonly"
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

            <class-form
              v-if="type === 'Class'"
              :readonly="readonly"
              :iri="obj.parentStructureIRI" />
            <property-form
              v-else-if="type === 'Property'"
              :readonly="readonly"
              :iri="obj.parentStructureIRI">

              <div
                v-show="!readonly"
                class="field is-grouped proposal-submit">
                <p class="control">
                  <button
                    id="submit"
                    class="button is-link is-medium">
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

            </property-form>
            <div v-else />

            <div
              v-show="isProposalAuthor && !isDraft"
              class="columns proposal-edit">
              <p class="column">
                <button
                  class="button submit-proposal"
                  @click="editProposal">
                  Edit Proposal
                </button>
              </p>
            </div>

            <h1
              id="conversation"
              class="title is-2 conversation-title">
              Conversation
            </h1>
            <div class="discussion">
              <discussion-card
                :discussion="discussion"
                @refreshDiscussion="refreshDiscussion" />
            </div>
            <div
              v-show="$store.state.auth.loggedIn"
              class="discussion">
              <discussion-reply
                :id="id"
                @answerAdded="refreshDiscussion" />
            </div>
          </div>
        </div>
      </section>

      <div v-else>
        <loader :show-if="true">
          <p class="subtitle">Loading Proposal</p>
        </loader>
      </div>

    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

import DiscussionCard from '@/components/discussion/DiscussionCard'
import DiscussionReply from '@/components/discussion/DiscussionReply'
import ClassForm from '@/components/proposal/ClassForm'
import PropertyForm from '@/components/proposal/PropertyForm'
import ProgressionBox from '@/components/proposal/ProgressionBox'
import Vote from '@/components/proposal/Vote'
import Loader from '@/components/layout/Loader'

import discussionById from '@/apollo/queries/discussionById'
import { EDIT, LOAD } from '@/store/action-types'
import { toastClose } from '@/libs/utils'
import { emptyDiscussion } from '@/libs/fixtures'

const {
  mapActions: propertyActions
} = createNamespacedHelpers('prop')
const {
  mapActions: classActions
} = createNamespacedHelpers('class')

export default {
  layout: 'default',
  async asyncData ({ route }) {
    return {
      id: parseInt(route.params.id, 10)
    }
  },
  components: {
    ClassForm,
    PropertyForm,
    ProgressionBox,
    DiscussionCard,
    DiscussionReply,
    Vote,
    Loader
  },
  data () {
    return {
      readonly: true,
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
    },
    isProposalAuthor () {
      return this.discussion.authorId === this.$store.state.auth.personId
    },
    isDraft () {
      return this.obj.isDraft
    }
  },
  methods: {
    ...classActions({
      loadClass: LOAD,
      editClass: EDIT
    }),
    ...propertyActions({
      loadProperty: LOAD,
      editProperty: EDIT
    }),
    authorsAvatar (name = '') {
      return `${name}'s avatar'`
    },
    refreshDiscussion (message) {
      this.$apollo.queries.discussion.refetch()
        .then(() => {
          if (message) {
            this.$toast.success(message, toastClose).goAway(1600)
          }
        })
    },
    async editProposal () {
      if (this.type === 'Class') {
        await this.editClass()
      }
      else {
        await this.editProperty()
      }
      await this.$store.dispatch('drafts/LOAD')

      this.$router.push({
        name: `proposal-${this.type.toLowerCase()}`,
        query: { id: this.id }
      })
    },
    init () {
      this.type = this.$proposalType(this.discussion.proposalObject)
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
      this.waitForAuth = setInterval(() => {
        if (!this.$store.state.authProcessDone) {
          return
        }
        clearInterval(this.waitForAuth)

        loader(this.id)
          .then((isDraft) => {
            if (isDraft !== true) {
              this.readonly = true
            }
          })
          .catch(() => {
            return this.$router.app.error({
              statusCode: 404,
              message: 'Not found'
            })
          })
      }, 200)
    }
  },
  beforeDestroy () {
    if (this.waitForAuth) {
      clearInterval(this.waitForAuth)
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
          id: parseInt(this.id || this.$route.params.id, 10)
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
            this.$router.push({ name: 'zom-discussion-id', params: { id: this.$route.params.id } })
          }
          this.init()
        }
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    }
  },
  head () {
    const h = {
      title: 'Proposal'
    }
    if (this.obj) {
      if (this.obj.label) {
        h.title += this.$headTitle(` '${this.obj.label}'`)
      }
      if (this.comment) {
        h.meta = [
          { hid: 'description', name: 'description', content: `Proposal '${this.obj.label}' on '${this.obj.parentStructureIRI}'` }
        ]
      }
    }
    return h
  }
}
</script>
