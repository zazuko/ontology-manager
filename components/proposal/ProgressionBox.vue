<template>
  <div
    class="progression-box box"
    v-sticky="true"
    sticky-side="top">
    <p class="label">
      Proposal Progression
    </p>
    <ul class="progression">
      <li
        v-for="(step, index) in progressionSteps"
        :key="index"
        :class="{ done: step.check() }">
        <a :href="anchor(step.id || obj[step.path])">
          <span v-if="step.check()">
            {{ step.textSuccess }}
            <span v-show="step.path">
              {{ obj[step.path] }}
            </span>
          </span>
          <span v-else>
            {{ step.textError }}
            <span v-show="step.path">
              <br>
              {{ obj[step.path] }}
            </span>
          </span>
        </a>
      </li>
    </ul>
    <div v-show="obj && !obj.isDraft">
      <hr />
      <ul class="progression">
        <li class="done">
          <a href="#conversation">Conversation</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import _get from 'lodash/get'
import { collectChildren } from '@/libs/utils'

export default {
  name: 'ProgressionBox',
  props: {
    edit: {
      type: Boolean,
      required: false,
      default: false
    },
    proposalPath: {
      type: String,
      required: true
    }
  },
  data () {
    return {}
  },
  computed: {
    adjective () {
      if (this.edit) {
        return ''
      }
      return 'New '
    },
    obj () {
      if (process.server) {
        return _get(this.$store.state, this.proposalPath)
      }
      return this.$deepModel(this.proposalPath)
    },
    flatChildren () {
      if (!this.obj) {
        return {}
      }
      if (this.obj.proposalType === 'Class') {
        return collectChildren(this.obj.propChildren, {}, 'propChildren')
      }
      if (this.obj.proposalType === 'Property') {
        return collectChildren(this.obj.classChildren, {}, 'classChildren')
      }
    },
    progressionSteps () {
      const steps = [
        this.motivationStep(),
        this.detailsStep()
      ]

      const newSteps = this.newSteps()
      if (newSteps.length) {
        steps.push(...newSteps)
      }

      if (_get(this.obj, 'isDraft', false)) {
        const lastStep = this.lastStep(steps)
        steps.push(lastStep)
      }
      return steps
    }
  },
  methods: {
    newSteps () {
      return Object.entries(this.flatChildren)
        .reduce((steps, [path, child]) => {
          steps.push(this.detailsStep(path, child))
          return steps
        }, [])
    },
    motivationStep (path = '') {
      return {
        check: () => this.obj[`${path}motivation`],
        textError: 'Enter a Motivation',
        textSuccess: 'Motivation',
        id: 'motivation'
      }
    },
    detailsStep (path = '', child = this.obj) {
      if (path) {
        path = `${path}.`
      }

      return {
        check: () => this.obj[`${path}label`] && this.obj[`${path}comment`],
        textError: `Enter ${this.adjective}${child && child.proposalType} Details:`,
        textSuccess: `${this.adjective}${child && child.proposalType}`,
        path: `${path}label`
      }
    },
    lastStep (steps) {
      return {
        check: () => {
          const flag = steps.reduce((acc, step, i, col) => {
            if (i !== col.length - 1) {
              return acc && step.check()
            }
            return acc
          }, true)
          this.$emit('step-done', flag)
          return flag
        },
        textError: 'Finalize and Submit Proposal',
        textSuccess: 'Finalize and Submit Proposal',
        id: 'submit'
      }
    },
    anchor (id) {
      return `#${id}`
    }
  }
}
</script>
