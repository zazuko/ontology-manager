<template>
  <section class="section">
    <form
      class="container"
      @submit.prevent="saveConfig">
      <template v-if="disabled">
        <h1 class="title">Showing version {{ config.id }}</h1>
      </template>
      <template v-else>
        <h1 class="title">Pre-filled with version {{ config.id }} values</h1>
        <p v-show="error">{{ error }}</p>
      </template>
      <h1 class="title">1. Editor Settings</h1>
      <h2 class="subtitle">1.1. General</h2>
      <p></p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Protocol &amp; Base URL</label>
        </div>
        <div class="field-body">
          <div class="field is-expanded">
            <div class="field has-addons">
              <p class="control">
                <span class="select">
                  <select
                    :disabled="disabled"
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
                  :disabled="disabled"
                  class="input code"
                  type="text"
                  v-model="editor.host"
                  placeholder="example.com"
                  required>
              </p>
            </div>
            <p class="help">
              The editor should be available at this address.
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
                :disabled="disabled"
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
          <label class="label">Editor Title</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :disabled="disabled"
                class="input"
                v-model="editor.meta.title"
                type="text"
                placeholder="ZOE - Zazuko Ontology Editor"
                required>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Editor Short Description</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :disabled="disabled"
                class="input"
                v-model="editor.meta.description"
                type="text"
                placeholder="Linked Data Ontology Editor for Domain Specialists"
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
                :disabled="disabled"
                class="input"
                v-model="editor.logoUrl"
                type="text"
                placeholder="Linked Data Ontology Editor for Domain Specialists"
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
                :disabled="disabled"
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
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Homepage columns</label>
        </div>
        <div class="field-body">
          <div class="field is-narrow">
            <div class="control">
              <div class="select is-fullwidth">
                <select
                  :disabled="disabled"
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
                  :disabled="disabled"
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
                :disabled="disabled"
                v-model="editor.text.login"
                class="textarea"></textarea>
            </p>
          </div>
        </div>
      </div>

      <hr>

      <h1 class="title">2. Ontology Settings</h1>
      <h2 class="subtitle">2.1. Bases</h2>
      <p></p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Dataset Base URL</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :disabled="disabled"
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
                :disabled="disabled"
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
                :disabled="disabled"
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
                :disabled="disabled"
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
      <h2 class="subtitle">2.2. Ontology Location</h2>
      <p></p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Ontology Raw URL</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                :disabled="disabled"
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
                :disabled="disabled"
                class="input"
                v-model="ontology.structureRawUrl"
                type="text"
                required>
            </p>
          </div>
        </div>
      </div>

      <div style="display: none">
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
        <p>
          Changing these will affect through which GitHub app users
          are signing in.
        </p>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">URL</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input
                  disabled="disabled"
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
                  disabled="disabled"
                  class="input"
                  type="text"
                  v-model="forge.oauthClientId"
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
                  disabled="disabled"
                  class="input"
                  type="text"
                  v-model="forge.oauthClientSecret"
                  required>
              </p>
            </div>
          </div>
        </div>

        <h2 class="subtitle">3.3. GitHub Personal Access Token</h2>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Token</label>
          </div>
          <div class="field-body">
            <div class="field">
              <p class="control is-expanded">
                <input
                  disabled="disabled"
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

      <hr>

      <h1 class="title">3. Save</h1>
      <div class="field is-horizontal">
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
        <div
          class="field-label is-normal">
          <!-- Left empty for spacing -->
          <label
            v-show="!disabled"
            class="label">Save as version {{ config.id + 1 }}</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <button
                v-if="disabled"
                :disabled="reason.length <= 2"
                class="button is-danger"
                type="submit">
                Revert to Version {{ config.id }}
              </button>
              <button
                v-else
                :disabled="reason.length <= 2"
                class="button is-danger"
                type="submit">
                Save &amp; Apply
              </button>
            </div>
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
    return {
      editor: clone(this.config.editor),
      forge: clone(this.config.forge || {}),
      ontology: clone(this.config.ontology || {}),
      numberOfColumns: this.config.editor.text.home.length,
      reason: '',
      error: ''
    }
  },
  computed: {
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
      const variables = {
        editor: this.editor,
        forge: this.forge,
        ontology: this.ontology,
        reason: this.reason
      }

      try {
        await this.$apollo.mutate({ mutation: saveConfig, variables })
        this.reason = ''
        this.$emit('configSaved')
      }
      catch (err) {
        console.error(err)
        this.error = err.message
        this.$sentry.captureException(err)
      }
      location.href = '#page-top'
    }
  }
}
</script>
