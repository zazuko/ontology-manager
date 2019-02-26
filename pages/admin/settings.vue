<template>
  <section class="container layout-admin">
    <admin-menu />

    <no-ssr>
      <admin-config-list
        :configs="configs"
        @showVersion="showVersion" />
      <admin-config-form
        v-if="shownVersion"
        :disabled="versionToShow < currentPrivateConfig.id"
        :config="shownVersion"
        @configSaved="refetch" />
    </no-ssr>
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
  middleware: 'authenticatedSuperadmin',
  components: {
    AdminMenu,
    AdminConfigList,
    AdminConfigForm
  },
  data () {
    return {
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
    },
    async reloadConfig () {
      const headers = { headers: { authorization: `Bearer ${this.$apolloHelpers.getToken()}` } }
      await Promise.all([
        axios.post('/trifid/reload-config', {}, headers),
        this.$store.dispatch('config/LOAD_CONFIG'),
        axios.post('/api/reload-config', {}, headers)
      ])
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
        return !this.$store.state.authProcessDone
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
        return !this.$store.state.authProcessDone
      }
    }
  },
  head () {
    const h = {
      title: this.$headTitle('Editor Settings - Admin')
    }
    return h
  }
}
</script>
