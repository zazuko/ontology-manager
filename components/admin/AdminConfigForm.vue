<template>
  <section class="section">
    <form
      class="container settings-form"
      @submit.prevent="saveConfig">
      <template v-if="disabled">
        <h1 class="title">Showing version {{ config.id }}</h1>
      </template>
      <template v-else-if="initialSetup">
        <h1 class="title">It's time to configure the editor!</h1>
        <p v-show="error">{{ error }}</p>
      </template>
      <template v-else>
        <h1 class="title">Pre-filled with version {{ config.id }} values</h1>
        <p v-show="error">{{ error }}</p>
      </template>
      <h1 class="title">1. Ontology Manager Settings</h1>
      <h2 class="subtitle">1.1. General</h2>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Protocol &amp; Domain</label>
        </div>
        <div class="field-body">
          <div class="field is-expanded">
            <div class="field has-addons">
              <p class="control">
                <span class="select">
                  <select
                    :readonly="disabled"
                    v-model="editor.protocol"
                    class="code">
                    <option>http</option>
                    <option>https</option>
                  </select>
                </span>
              </p>
              <p class="control">
                <a class="button is-static code">
                  ://
                </a>
              </p>
              <p class="control is-expanded">
                <input
                  :readonly="disabled"
                  class="input code"
                  type="text"
                  v-model="editor.host"
                  placeholder="example.com"
                  required>
              </p>
            </div>
            <p class="help">
              The above settings have already been validated, only change them if you know what you are doing.
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Customer Display Name</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="editor.meta.customerName"
                type="text"
                placeholder="Zazuko GmbH"
                required>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Ontology Manager Title</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="editor.meta.title"
                type="text"
                placeholder="ZOM - Zazuko Ontology Manager"
                required>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Ontology Manager Short Description</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="editor.meta.description"
                type="text"
                placeholder="Linked Data Ontology Manager for Domain Specialists"
                required>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Logo URL</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="editor.logoUrl"
                type="text"
                placeholder="Linked Data Ontology Manager for Domain Specialists"
                required>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Name of a Group</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="editor.text.groupName"
                type="text"
                placeholder="Group"
                required>
            </p>
            <p class="help">
              Popular names for a group of classes include "Container", "Group", "Pouch", "Folder"…
            </p>
          </div>
        </div>
      </div>
      <h2 class="subtitle">1.2. Textual Contents</h2>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Homepage Columns</label>
        </div>
        <div class="field-body">
          <div class="field is-narrow">
            <div class="control">
              <div class="select is-fullwidth">
                <select
                  :readonly="disabled"
                  name="columns"
                  v-model="numberOfColumns">
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Homepage Columns Content</label>
        </div>
        <div class="field-body">
          <div class="field is-expanded">
            <div class="field has-addons columns">
              <p
                class="control column"
                v-for="(key, index) in editor.text.home"
                :key="index">
                <textarea
                  :readonly="disabled"
                  class="textarea"
                  v-model="editor.text.home[index]"></textarea>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Login Modal Text</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control">
              <textarea
                :readonly="disabled"
                v-model="editor.text.login"
                class="textarea"></textarea>
            </p>
          </div>
        </div>
      </div>

      <hr>

      <h1 class="title">2. Ontology Settings</h1>
      <h2 class="subtitle">2.1. Bases</h2>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Dataset Base URL</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="ontology.datasetBaseUrl"
                type="text"
                required>
            </p>
            <p class="help">
              IRIs start with this
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Class Base URL</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="ontology.classBaseUrl"
                type="text"
                required>
            </p>
            <p class="help">
              Created classes (<code>http://www.w3.org/2000/01/rdf-schema#Class</code>) will have this base
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Property Base URL</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="ontology.propertyBaseUrl"
                type="text"
                required>
            </p>
            <p class="help">
              Created properties (<code>http://www.w3.org/1999/02/22-rdf-syntax-ns#Property</code>) will have this base
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Containers Nesting Predicate</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="ontology.containersNestingPredicate"
                type="text"
                placeholder="http://schema.org/hasPart"
                required>
            </p>
            <p class="help">
              This predicate is used to file classes into containers, it is what gets containers to be properly
              displayed as nested containers on the homepage. Only used by the structure ontology, not part of the ontology
              proper.
            </p>
          </div>
        </div>
      </div>
      <h2 class="subtitle">2.2. Ontology Location &amp; Access</h2>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Owner Name</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="editor.github.owner"
                type="text"
                required>
            </p>
            <p class="help">
              The GitHub user or GitHub organization to which the repo belongs:
              <code>http://github.com/<u>owner</u>/repo-name</code>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Repository Name</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="editor.github.repo"
                type="text"
                required>
            </p>
            <p class="help">
              The GitHub repository name:
              <code>http://github.com/owner/<u>repo-name</u></code>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Branch Name</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="editor.github.branch"
                type="text"
                required>
            </p>
            <p class="text">Name of the default branch the editor will use, usually
              <code>master</code>. <span v-show="branchesHint">Visible here: <a
                :href="branchesHint"
                target="_blank">{{ branchesHint }}</a></span>
            </p>
          </div>
        </div>
      </div>
      <p class="text">
        The <em>Raw URLs</em> should point to the location of the source of truth, served as plain text.<br>
        <span v-show="rawFilesHint">
          On GitHub these URLs look like this: <code>{{ rawFilesHint }}</code>
        </span>
      </p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Ontology Raw URL</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="ontology.ontologyRawUrl"
                type="text"
                required>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Structure Raw URL</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="ontology.structureRawUrl"
                type="text"
                required>
            </p>
          </div>
        </div>
      </div>

      <h2 class="subtitle">2.3. Resources Location</h2>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Ontology Resource Path</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :readonly="disabled"
                class="input"
                v-model="ontology.ontologyResourceUrl"
                type="text"
                required>
            </p>
            <p class="help">
              The ontology will be accessible at <code>{{ ontologyResourceUrl }}</code>
              by either specifying the format: <code>{{ ontologyResourceUrl }}?format=ttl</code>
              or using content negotiation.
            </p>
          </div>
        </div>
      </div>

      <div>
        <hr>

        <h1 class="title">3. Forge Settings</h1>
        <h2 class="subtitle">3.1. Login Strategy</h2>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Strategy</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <div class="select is-fullwidth">
                  <select
                    name="loginStrategy"
                    disabled>
                    <option>GitHub</option>
                    <option>Local</option>
                  </select>
                </div>
              </div>
              <p class="help">
                Any OAuth API can be used for users to sign in.
              </p>
            </div>
          </div>
        </div>

        <h2 class="subtitle">3.2. OAuth Settings</h2>
        <p class="text">
          Create a <a
            href="https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/"
            target="_blank">GitHub OAuth App</a> and copy the <code>Client ID</code> and
          <code>Client Secret</code>.
          <br>
          Enter the same value for both <strong><code>Homepage URL</code></strong>
          <strong><code>Authorization callback URL</code></strong>, this value must match
          the address at which the editor is available. Based on what you set in
          <code>1.1. General</code> above, it should be: <code>{{ editor.protocol }}://{{ editor.host }}</code>
        </p>
        <div
          style="display: none"
          class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">URL</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input
                  readonly="disabled"
                  class="input"
                  type="text"
                  placeholder="https://github.com/login/oauth"
                  v-model="forge.oauthHost"
                  required>
              </p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Client ID</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input
                  class="input"
                  type="text"
                  v-model="editor.github.oauthClientId"
                  required>
              </p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Client Secret</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input
                  class="input"
                  type="text"
                  v-model="forge.oauthClientSecret"
                  required>
              </p>
            </div>
          </div>
        </div>

        <h2 class="subtitle">3.3. GitHub Personal Access Token</h2>
        <p class="text">
          The editor requires a <a
            href="https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line#creating-a-token"
            target="_blank">Personal Access Token</a> to push changes to GitHub.<br>
          It is best to create a separate GitHub account for this and grant it read and write
          access to <code v-show="repoHint">{{ repoHint }}</code><span v-show="!repoHint">your repository.</span>
        </p>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Token</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input
                  class="input"
                  type="text"
                  v-model="forge.committerPersonalAccessToken"
                  placeholder=""
                  required>
              </p>
              <p class="help">
                A GitHub Personal Access Token is required for the editor to interact with GitHub: create
                pull requests, merge them, etc.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <hr>

        <h1 class="title">4. Email Settings</h1>
        <h2 class="subtitle">4.1. SMTP Parameters</h2>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Port &amp; Server</label>
          </div>
          <div class="field-body">
            <div class="field is-expanded">
              <div class="field has-addons">
                <p class="control">
                  <input
                    :readonly="disabled"
                    v-model="smtp.smtpPort"
                    class="input code">
                </p>
                <p class="control is-expanded">
                  <input
                    :readonly="disabled"
                    class="input code"
                    type="text"
                    v-model="smtp.smtpServer"
                    placeholder="">
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">SMTP User</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input
                  class="input"
                  type="text"
                  v-model="smtp.smtpUser"
                  placeholder="">
              </p>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">SMTP Password</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input
                  class="input"
                  type="text"
                  v-model="smtp.smtpPassword"
                  placeholder="">
              </p>
            </div>
          </div>
        </div>

        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Secure</label>
          </div>
          <div class="field-body">
            <div class="field is-narrow">
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="smtp.secure">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <p class="help">
                <a
                  href="https://nodemailer.com/smtp/#tls-options"
                  target="_blank">
                  read more
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr>

      <h1 class="title">4. Save</h1>
      <div
        v-show="!editor.setup"
        class="field is-horizontal">
        <div class="field-label is-normal">
          <!-- Left empty for spacing -->
          <label class="label">Reason</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                class="input"
                type="text"
                v-model="reason"
                placeholder=""
                required>
            </p>
            <p class="help">
              Explain your changes
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label
            v-show="!disabled && !initialSetup"
            class="label">
            Save as version {{ config.id + 1 }}
          </label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <button
                v-if="disabled"
                :readonly="reason.length <= 2"
                class="button is-danger"
                type="submit">
                Revert to Version {{ config.id }}
              </button>
              <button
                v-else
                :readonly="reason.length <= 2"
                class="button is-danger"
                type="submit">
                Save &amp; Apply
              </button>
            </div>
            <p
              class="help"
              v-show="initialSetup">
              (The editor will restart, it will take around 30 seconds.)
            </p>
          </div>
        </div>
      </div>

    </form>
  </section>
</template>

<script>
import clone from 'clone'
import saveConfig from '@/apollo/mutations/saveConfig'

export default {
  name: 'AdminConfigForm',
  props: {
    config: {
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    const initialSetup = this.$store.state.config.setup
    return {
      initialSetup,
      editor: clone(this.config.editor),
      forge: clone(this.config.forge || {}),
      ontology: clone(this.config.ontology || {}),
      smtp: clone(this.config.smtp || {}),
      numberOfColumns: this.config.editor.text.home.length,
      reason: initialSetup ? 'Initial Config' : '',
      error: ''
    }
  },
  computed: {
    ontologyResourceUrl () {
      return `${this.ontology.datasetBaseUrl}${(this.ontology.ontologyResourceUrl || '').replace(new RegExp('^/', 'g'), '')}`
    },
    repoHint () {
      if (!this.editor.github.owner || !this.editor.github.repo) {
        return ''
      }
      return `https://github.com/${this.editor.github.owner}/${this.editor.github.repo}`
    },
    branchesHint () {
      if (!this.repoHint) {
        return ''
      }
      return `${this.repoHint}/branches`
    },
    rawFilesHint () {
      if (!this.editor.github.owner || !this.editor.github.repo || !this.editor.github.branch) {
        return ''
      }
      return `https://raw.githubusercontent.com/${this.editor.github.owner}/${this.editor.github.repo}/${this.editor.github.branch}/your-ontology-file.nt`
    }
  },
  watch: {
    config () {
      this.editor = clone(this.config.editor)
      this.forge = clone(this.config.forge || {})
      this.ontology = clone(this.config.ontology || {})
      this.numberOfColumns = this.config.editor.text.home.length
      this.reason = ''
    },
    numberOfColumns () {
      while (this.editor.text.home.length > this.numberOfColumns) {
        this.editor.text.home.pop()
      }
      while (this.editor.text.home.length < this.numberOfColumns) {
        const existingText = this.config.editor.text.home[this.editor.text.home.length - 1]
        this.editor.text.home.push(existingText)
      }
    }
  },
  methods: {
    async saveConfig () {
      this.error = ''
      delete this.editor.setup

      if (this.smtp.secure) {
        this.smtp.secure = this.smtp.secure === 'true'
      }

      const variables = {
        editor: this.editor,
        forge: this.forge,
        ontology: this.ontology,
        reason: this.reason,
        smtp: this.smtp
      }

      try {
        await this.$apollo.mutate({ mutation: saveConfig, variables })
        this.reason = ''
        this.$emit('configSaved')
      }
      catch (err) {
        console.error(err)
        this.editor.setup = true
        this.error = err.message
        this.$sentry.captureException(err)
      }
      location.href = '#page-top'
    }
  }
}
</script>
