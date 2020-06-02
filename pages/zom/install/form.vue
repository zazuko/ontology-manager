<template>
  <section class="container layout-admin">
    <client-only>
      <template v-if="error">
        <p>{{ error }}</p>
      </template>

      <admin-config-form
        :config="this.$store.state.config"
        @configSaved="reboot" />

      <loader :show-if="rebooting">
        <p class="subtitle">
          Restarting the server.
        </p>
        <p>
          You will be redirected shortly.
        </p>
      </loader>
    </client-only>
  </section>
</template>

<script>
import axios from 'axios'
import AdminConfigForm from '@/components/admin/AdminConfigForm'
import Loader from '@/components/layout/Loader'

export default {
  layout: 'default',
  components: {
    AdminConfigForm,
    Loader
  },
  data () {
    return {
      error: '',
      rebooting: false
    }
  },
  mounted () {
    if (this.$store.state.config.setup === false) {
      this.$router.push('/')
    }
    else if (this.$store.state.config.setup === 'step1') {
      this.$router.push('/zom/install')
    }
  },
  methods: {
    async reboot () {
      try {
        axios.post('/api/reboot-app')
        this.rebooting = true
        setTimeout(() => {
          const protocol = window.location.protocol.split(':')[0]
          const host = window.location.host
          location.replace(`${protocol}://${host}`)
        }, 20 * 1000)
      }
      catch (err) {
        this.error = err.message
        console.error(err)
      }
    }
  },
  head () {
    const h = {
      title: this.$headTitle('Ontology Manager Installation')
    }
    return h
  },
  validate ({ store, redirect }) {
    if (store.state.config.setup === 'step1') {
      redirect('/zom/install')
      return true
    }
    else if (store.state.config.setup === false) {
      redirect('/')
      return true
    }
    return !!store.state.config.setup
  }
}
</script>
