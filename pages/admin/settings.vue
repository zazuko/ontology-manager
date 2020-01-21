<template>
  <section class="container layout-admin">
    <admin-menu />

    <client-only>
      <admin-config-list
        :configs="configs"
        @showVersion="showVersion" />

      <template v-if="error">
        <p>{{ error }}</p>
      </template>

      <admin-config-form
        v-if="shownVersion"
        :disabled="versionToShow < currentPrivateConfig.id"
        :config="shownVersion"
        @configSaved="refetch" />
    </client-only>
  </section>
</template>

<script>
import axios from 'axios'
import currentPrivateConfig from '@/apollo/queries/currentPrivateConfig'
import privateConfigVersion from '@/apollo/queries/privateConfigVersion'
import configList from '@/apollo/queries/configList'
import AdminMenu from '@/components/admin/AdminMenu'
import AdminConfigList from '@/components/admin/AdminConfigList'
import AdminConfigForm from '@/components/admin/AdminConfigForm'

export default {
  layout: 'default',
  middleware: 'authenticatedSuperadmin',
  components: {
    AdminMenu,
    AdminConfigList,
    AdminConfigForm
  },
  data () {
    return {
      error: '',
      currentConfig: null,
      configs: [],
      versionToShow: null,
      configVersions: {},
      shownVersion: this.currentConfig
    }
  },
  methods: {
    showVersion (id) {
      this.versionToShow = parseInt(id, 10)
      if (this.configVersions[this.versionToShow]) {
        this.shownVersion = this.configVersions[this.versionToShow]
      }
      else {
        this.$apollo.queries.privateConfigVersion.setVariables({
          version: this.versionToShow
        })
      }
    },
    async refetch () {
      this.$apollo.queries.configList.refetch()
      await this.reloadConfig()
    },
    async reloadConfig () {
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      try {
        await Promise.all([
          axios.post('/api/reload-app', {}, headers),
          this.$store.dispatch('config/LOAD_CONFIG')
        ])
      }
      catch (err) {
        this.error = err.message
        console.error(err)
      }
    }
  },
  apollo: {
    privateConfigVersion: {
      prefetch: false,
      query: privateConfigVersion,
      result ({ data, loading }) {
        if (!loading) {
          this.configVersions[this.versionToShow] = this.shownVersion = data.privateConfigVersion
        }
      },
      skip () {
        return !this.versionToShow || !this.$store.state.authProcessDone
      }
    },
    currentPrivateConfig: {
      prefetch: false,
      query: currentPrivateConfig,
      result ({ data, loading }) {
        if (!loading) {
          this.currentConfig = data.currentPrivateConfig
        }
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    },
    configList: {
      prefetch: false,
      query: configList,
      result ({ data, loading }) {
        if (!loading) {
          this.configs = data.configList.nodes
        }
      },
      skip () {
        return (process.client && !this.$store.state.authProcessDone)
      }
    }
  },
  head () {
    const h = {
      title: this.$headTitle('Ontology Manager Settings - Admin')
    }
    return h
  }
}
</script>
