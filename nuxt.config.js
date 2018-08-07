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
  modules: ['@nuxtjs/apollo'],
  // Give apollo module options
  apollo: {
    tokenName: process.env.TOKENSECRET,
    // required
    clientConfigs: {
      default: {
        // required
        httpEndpoint: 'http://localhost:5000/graphql',
        // You can use `wss` for secure connection (recommended in production)
        // Use `null` to disable subscriptions
        wsEndpoint: null
      }
      // test: {
      //   httpEndpoint: 'http://localhost:5000',
      //   wsEndpoint: 'http://localhost:5000',
      //   tokenName: 'apollo-token'
      // },
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
