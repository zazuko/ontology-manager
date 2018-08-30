module.exports = {
  ontology: {
    github: {
      repo: 'o',
      owner: 'vhf',
      branch: 'example-com',
      files: {
        'ontology.nt': true
      },
      committer: {
        name: 'Ontology Editor',
        email: 'victor.felder@zazuko.com',
        get date () {
          return (new Date()).toISOString()
        }
      }
    }
  },
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
  css: [
    { lang: 'scss', src: '@/assets/scss/app.scss' }
  ],
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/apollo',
    '@nuxtjs/toast'
  ],
  /*
  ** Modules config: apollo
  */
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost:5000/graphql',
        // You can use `wss` for secure connection (recommended in production)
        // Use `null` to disable subscriptions
        wsEndpoint: null
      }
    }
  },
  /*
  ** Modules config: auth
  */
  auth: {
    strategies: {
      local: false,
      github: {
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET,
        scope: ['user:email']
      }
    }
  },
  /*
  ** Modules config: toast
  */
  toast: {
    position: 'top-right',
    containerClass: 'notification-toast',
    className: 'notification'
  },
  /*
  ** Internal API
  */
  serverMiddleware: [
    '~/api/',
    '~/trifid/'
  ],
  /*
  ** Middleware configuration https://nuxtjs.org/guide/routing#middleware
  */
  router: {
    middleware: 'iri',
    extendRoutes (routes, resolve) {
      routes.push({
        path: '*',
        component: resolve(__dirname, 'pages/fallback.vue')
      })
    }
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Custom PostCSS config
    */
    postcss: {
      plugins: {
        'postcss-custom-properties': false
      }
    },
    extend (config, { isDev }) {
      /*
      ** Run ESLint on save
      */
      if (isDev && process.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      /*
      ** Make Bulma @importable
      */
      for (const rule of config.module.rules) {
        if (rule.use) {
          for (const use of rule.use) {
            if (use.loader === 'sass-loader') {
              use.options = use.options || {}
              use.options.includePaths = ['node_modules/bulma/bulma']
            }
          }
        }
      }
    }
  }
}
