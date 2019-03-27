<template>
  <section class="container layout-admin">
    <no-ssr>
      <template v-if="error">
        <p>{{ error }}</p>
      </template>
      <section class="section">
        <form
          class="container settings-form"
          @submit.prevent="setup">
          <h1 class="title">Editor Configuration</h1>
          <h2 class="subtitle">Step 1</h2>

          <p class="text">
            First of all we need to make sure the editor runs on the correct host using the right protocol.<br>
            The form has been pre-filled with values the system thinks are correct.
          </p>

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
                        v-model="protocol"
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
                      class="input code"
                      type="text"
                      v-model="host"
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
              <label class="label"></label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <button
                    class="button is-danger"
                    type="submit">
                    Save &amp; Apply
                  </button>
                </div>
                <p class="help">
                  (The editor will restart, it will take around 30 seconds.)
                </p>
              </div>
            </div>
          </div>
          <!-- <admin-config-form
          :config="this.$store.state.config"
          @configSaved="reboot" /> -->

          <loader :show-if="rebooting">
            <p class="subtitle">
              Restarting the server.
            </p>
            <p>
              You will be redirected shortly.
            </p>
          </loader>
        </form>
      </section>
    </no-ssr>
  </section>
</template>

<script>
// axios hasn't been properly configured yet, which makes graphql unusable
// that's why we first need to set this up before relying on the graphql API
import { toastClose } from '@/libs/utils'
import Loader from '@/components/layout/Loader'

export default {
  components: {
    Loader
  },
  data () {
    return {
      protocol: '',
      host: '',
      error: '',
      rebooting: false
    }
  },
  async mounted () {
    if (process.browser) {
      const cookies = document.cookie.split(';')

      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }
    }

    if (this.$store.state.config.setup === false) {
      setTimeout(() => {
        location = `${this.protocol}://${this.host}`
      }, 500)
      return
    }
    else if (this.$store.state.config.setup === 'step2') {
      this.$router.push('/install/form')
      return
    }
    this.protocol = window.location.protocol.split(':')[0]
    this.host = window.location.host
  },
  methods: {
    async checkForm () {
      try {
        await fetch(`${this.protocol}://${this.host}/graphql`, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        })
      }
      catch (err) {
        this.$toast.error(`Failed to reach <code>${this.protocol}://${this.host}</code>, please double-check.`, toastClose).goAway(4000)
        return false
      }
      return true
    },
    async isUp () {
      try {
        this.checkInProgress = true
        await fetch(`${this.protocol}://${this.host}/api/`)
      }
      catch (err) {
        this.checkInProgress = false
        return false
      }
      this.checkInProgress = false
      return true
    },
    async setup () {
      const hostOk = await this.checkForm()
      if (!hostOk) {
        return
      }
      try {
        await fetch(`${this.protocol}://${this.host}/api/setup`, {
          method: 'POST',
          cache: 'no-cache',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            host: this.host,
            protocol: this.protocol
          })
        })
      }
      catch (err) {
        console.error(err)
      }
      this.rebooting = true
      setTimeout(() => {
        const checker = setInterval(async () => {
          if (this.checkInProgress) {
            return
          }
          if (await this.isUp()) {
            clearInterval(checker)
            setTimeout(() => {
              location.reload()
            }, 10 * 1000)
          }
        }, 500)
      }, 1000)
    }
  },
  head () {
    const h = {
      title: this.$headTitle('Editor Installation')
    }
    return h
  },
  validate ({ store, redirect }) {
    if (store.state.config.setup !== 'step1') {
      redirect('/install/form')
      return true
    }
    return !!store.state.config.setup
  }
}
</script>
