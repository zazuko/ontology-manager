const envInit = require('./setup/env-init')
const editorConfig = require('./editor.config')
const feedCreate = require('./libs/feed')

envInit(process.env.NODE_TEST ? 'test' : 'dev')

module.exports = {
  mode: 'universal',

  /*
  ** Headers of the page
  */
  head: {
    title: editorConfig.website.head.title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: editorConfig.website.head.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  /*
  ** Global CSS
  */
  css: [
    { lang: 'scss', src: '@/assets/scss/app.scss' }
  ],

  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/filters',
    '@/plugins/directives',
    { src: '@/plugins/nuxt-client-init', ssr: false },
    { src: '@/plugins/sticky', ssr: false }
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@/modules/vue-deepset',
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/apollo',
    '@nuxtjs/toast',
    '@nuxtjs/sentry',
    '@nuxtjs/feed'
  ],

  /*
  ** Module config: apollo
  */
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: `${process.env.EDITOR_PROTOCOL || 'http'}://${process.env.EDITOR_HOST || 'localhost:3000'}/graphql`,
        // You can use `wss` for secure connection (recommended in production)
        // Use `null` to disable subscriptions
        wsEndpoint: null // `ws://${process.env.EDITOR_HOST || 'localhost:3000'}/graphql`,
      }
    }
  },

  /*
  ** Module config: auth
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
  ** Module config: toast
  */
  toast: {
    position: 'top-right',
    containerClass: 'notification-toast',
    className: 'notification'
  },

  /*
  ** Module config: sentry
  */
  sentry: {
    disabled: !process.env.SENTRY_DSN,
    disableClientSide: !process.env.SENTRY_DSN
  },

  /*
  ** Module config: feed
  */
  feed: [{
    path: '/atom.xml',
    create: feedCreate('atom'),
    cacheTime: 1000 * 60 * 5,
    type: 'atom1'
  }, {
    path: '/rss.xml',
    create: feedCreate('rss'),
    cacheTime: 1000 * 60 * 5,
    type: 'rss2'
  }],

  /*
  ** Internal API
  */
  serverMiddleware: [
    '@/postgraphile/limit',
    '@/postgraphile/graphile',
    '@/api/',
    // always keep trifid as last serverMiddleware, otherwise it will swallow
    // errors and logs from previous middlewares!
    '@/trifid/'
  ],

  /*
  ** Middleware configuration https://nuxtjs.org/guide/routing#middleware
  */
  router: {
    middleware: 'iri',
    extendRoutes (routes, resolve) {
      routes.push({
        path: '/:p1',
        component: resolve(__dirname, 'pages/fallback.vue')
      }, {
        path: '/:p1/:p2',
        component: resolve(__dirname, 'pages/fallback.vue')
      }, {
        path: '/:p1/:p2/:p3',
        component: resolve(__dirname, 'pages/fallback.vue')
      }, {
        path: '/:p1/:p2/:p3/:p4',
        component: resolve(__dirname, 'pages/fallback.vue')
      }, {
        path: '*',
        component: resolve(__dirname, 'pages/fallback.vue')
      })
    }
  },

  // https://nuxtjs.org/api/configuration-env
  env: {
    CUSTOMER_NAME: process.env.CUSTOMER_NAME,
    DATASET_BASE_URL: process.env.DATASET_BASE_URL,
    CLASS_BASE_URL: process.env.CLASS_BASE_URL,
    PROPERTY_BASE_URL: process.env.PROPERTY_BASE_URL,
    CONTAINERS_NESTING_PREDICATE: process.env.CONTAINERS_NESTING_PREDICATE,
    ONTOLOGY_FILENAME: process.env.ONTOLOGY_FILENAME,
    STRUCTURE_FILENAME: process.env.STRUCTURE_FILENAME
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** Custom PostCSS config
    */
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    },
    extend (config, { isDev }) {
      // https://github.com/Akryum/vue-cli-plugin-apollo/issues/57
      config.module.rules.push({
        test: /\.mjs$/,
        type: 'javascript/auto',
        include: [
          /node_modules/
        ]
      })
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
