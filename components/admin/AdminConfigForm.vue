<template>
  <section class="section">
    <div class="container">
      <h1 class="title">1. Editor Settings</h1>
      <h2 class="subtitle">1.1. General</h2>
      <p></p>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Customer Display Name</label>
        </div>
        <div class="field-body">
          <div class="field">
            <p class="control is-expanded">
              <input
                class="input"
                name="customerName"
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
                class="input"
                name="customerName"
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
                class="input"
                name="customerName"
                type="text"
                placeholder="Linked Data Ontology Editor for Domain Specialists"
                required>
            </p>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Strategy</label>
        </div>
        <div class="field-body">
          <div class="field is-narrow">
            <div class="control">
              <div class="select is-fullwidth">
                <select
                  name="strategy"
                  disabled>
                  <option>GitHub</option>
                  <option>Local</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label class="label">Protocol &amp; Base URL</label>
        </div>
        <div class="field-body">
          <div class="field has-addons">
            <p class="control">
              <span class="select">
                <select
                  name="protocol"
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
            <p class="control">
              <input
                class="input code"
                type="text"
                name="host"
                placeholder="example.com"
                required>
            </p>
          </div>
        </div>
      </div>

      <hr>

      <h2 class="subtitle">1.2. GitHub Personal Access Token</h2>
      <p>
        A GitHub Personal Access Token is required for the editor to interact with GitHub: create
        pull requests, merge them, etc.
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
                placeholder=""
                required>
            </p>
          </div>
        </div>
      </div>

      <h1 class="title">3. Forge Settings</h1>
      <h2 class="subtitle">3.1. OAuth Settings</h2>
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
                class="input"
                type="text"
                placeholder="https://github.com/login/oauth"
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
                required>
            </p>
          </div>
        </div>
      </div>

      <hr>

      <h2 class="subtitle">3.2. GitHub Personal Access Token</h2>
      <p>
        A GitHub Personal Access Token is required for the editor to interact with GitHub: create
        pull requests, merge them, etc.
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
                placeholder=""
                required>
            </p>
          </div>
        </div>
      </div>

      <hr>

      <div class="field is-horizontal">
        <div class="field-label">
          <!-- Left empty for spacing -->
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <button class="button is-danger">
                Save &amp; Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AdminConfigForm'
}
</script>
