<template>
  <section class="container layout-admin">
    <admin-menu />

    <no-ssr>
      <admin-config-list
        :configs="configs"
        @showVersion="showVersion" />
      <template v-if="versionToShow">
        <pre>
          {{ shownVersion }}
        </pre>
      </template>
      <admin-config-form />
    </no-ssr>
  </section>
</template>

<script>
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
  data: () => ({
    currentConfig: {},
    configs: [],
    versionToShow: null,
    configVersions: {},
    shownVersion: {}
  }),
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
    refetch () {
      this.$apollo.queries.configList.refetch()
    }
  },
  apollo: {
    privateConfigVersion: {
      prefetch: false,
      query: privateConfigVersion,
      result ({ data, loading }) {
        if (!loading) {
          this.configVersions[this.versionToShow] = data.privateConfigVersion
          this.shownVersion = this.configVersions[this.versionToShow]
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
