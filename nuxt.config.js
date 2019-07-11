import fetchConfig from './setup/fetch-config'
import feedCreate from './libs/feed'
import { version } from './package.json'

module.exports = async () => {
  const editorConfig = await fetchConfig()
  const { protocol } = editorConfig.editor

  return {
    rootDir: __dirname,

    mode: 'universal',

    // https://nuxtjs.org/api/configuration-modern
    modern: false,

    /*
    ** Headers of the page
    */
    head: {
      title: editorConfig.editor.meta.title,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: editorConfig.editor.meta.description }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },

    /*
    ** Global CSS
    */
    css: [
      // { lang: 'scss', src: '@/assets/scss/app.scss' }
    ],

    /*
    ** Customize the progress bar color
    */
    loading: { color: '#3B8070' },

    /*
    ** Plugins to load before mounting the App
    * Order matters!
    */
    plugins: [
      '@/plugins/sentry',
      '@/plugins/libs/rdf',
      '@/plugins/models/Class',
      '@/plugins/models/Property',
      '@/plugins/libs/proposals',
      '@/plugins/libs/utils',
      '@/plugins/filters',
      '@/plugins/directives',
      '@/plugins/nuxt-init.client',
      '@/plugins/sticky.client'
    ],

    /*
    ** Nuxt.js modules
    */
    modules: [
      '@/modules/healthcheck',
      '@/modules/vue-deepset',
      '@nuxtjs/axios',
      '@nuxtjs/auth',
      '@nuxtjs/apollo',
      '@nuxtjs/toast',
      '@nuxtjs/sentry',
      '@nuxtjs/feed',
      ['nuxt-env', {
        keys: [
          { key: 'EDITOR_STYLE', default: 'dcf' }
        ]
      }]
    ],

    /*
    ** Module config: healthcheck
    */
    healthcheck: {
      path: '/api/health',
      contentType: 'text/plain',
      healthy: () => {
        return 'ok'
      }
    },

    /*
    ** Module config: axios
    */
    axios: {
      https: protocol === 'https'
    },

    /*
    ** Module config: apollo
    */
    apollo: {
      clientConfigs: {
        default: {
          httpEndpoint: `${editorConfig.editor.protocol}://${editorConfig.editor.host}/graphql`,
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
      strategies: process.env.NODE_TEST ? {
        local: {
          endpoints: {
            login: { url: '/api/auth/login', method: 'post', propertyName: 'token' },
            logout: { url: '/api/auth/logout', method: 'post' },
            user: { url: '/api/auth/user', method: 'get', propertyName: 'user' }
          }
        }
      } : (process.env.NODE_ENV === 'production' ? {
        local: false,
        github: {
          client_id: 'EDITOR_OAUTH_CLIENT_ID',
          client_secret: 'EDITOR_OAUTH_CLIENT_SECRET',
          scope: ['user:email']
        }
      } : {
        local: false,
        github: {
          client_id: process.env.OAUTH_CLIENT_ID,
          client_secret: process.env.OAUTH_CLIENT_SECRET,
          scope: ['user:email']
        }
      })
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
      config: {
        release: version
      }
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
    env: {},

    /*
    ** Build configuration
    */
    build: {
      extractCSS: true,
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
      extend (config, { isDev, isClient }) {
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
        if (isDev && isClient) {
          config.devtool = '#source-map'
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
}
