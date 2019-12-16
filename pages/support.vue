<template>
  <div class="container layout-objects-list">
    <section class="container layout-objects-list-head has-text-left">
      <h1 class="main-title has-text-left">
        Support
      </h1>
      <h2 class="subtitle has-text-left">
        Report Bugs / Get Help
      </h2>

      <div class="columns">
        <div class="column content">
          <p>
            <a
              :href="bug"
              class="button is-warning">
              Report a Bug or Issue
            </a>
          </p>
          <p>
            <a
              :href="question"
              class="button is-success">
              Ask a Question
            </a>
          </p>
          <p>
            <a
              :href="issues"
              class="button is-info">
              See all support requests
            </a>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { version } from '@/package.json'

export default {
  layout: 'background',
  components: {},
  computed: {
    issues () {
      return 'https://github.com/' + [
        this.$store.state.config.editor.github.owner,
        this.$store.state.config.editor.github.repo,
        'issues'
      ].join('/')
    },
    bug () {
      return 'https://github.com/' + [
        this.$store.state.config.editor.github.owner,
        this.$store.state.config.editor.github.repo,
        'issues',
        'new?template=bug_report.md'
      ].join('/')
    },
    question () {
      return 'https://github.com/' + [
        this.$store.state.config.editor.github.owner,
        this.$store.state.config.editor.github.repo,
        'issues',
        'new?template=question.md'
      ].join('/')
    }
  },
  data () {
    return {
      version
    }
  }
}
</script>
