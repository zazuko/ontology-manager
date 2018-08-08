module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'ontology-editor',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Semantic Web, RDF ontology editor' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/apollo'
  ],
  apollo: {
    tokenName: process.env.POSTGRAPHILE_TOKEN_SECRET,
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost:5000/graphql',
        // You can use `wss` for secure connection (recommended in production)
        // Use `null` to disable subscriptions
        wsEndpoint: null
      }
    }
  },
  auth: {
    strategies: {
      local: false,
      github: {
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        scope: ['user:email']
      }
    },
    redirect: {
      login: '/',
      logout: '/',
      callback: '/',
      user: '/'
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
