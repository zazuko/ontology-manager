const { ApolloClient } = require('apollo-client')
const { split, from } = require('apollo-link')
const { createUploadLink } = require('apollo-upload-client')
const { InMemoryCache } = require('apollo-cache-inmemory')
const { SubscriptionClient } = require('subscriptions-transport-ws')
const { WebSocketLink } = require('apollo-link-ws')
const { getMainDefinition } = require('apollo-utilities')
const { createPersistedQueryLink } = require('apollo-link-persisted-queries')
const { setContext } = require('apollo-link-context')
const { withClientState } = require('apollo-link-state')
const fetch = require('isomorphic-fetch')

const clients = {}
module.exports = async (options = {}) => {
  const key = JSON.stringify(options)
  if (clients[key]) {
    return clients[key]
  }

  // Config
  const nuxtOptions = await require('../nuxt.config')()
  const nuxtApolloOptions = nuxtOptions.apollo.clientConfigs.default

  const defaultOptions = Object.assign({
    // You can use `https` for secure connection (recommended in production)
    httpEndpoint: null,
    // You can use `wss` for secure connection (recommended in production)
    // Use `null` to disable subscriptions
    wsEndpoint: null, // nuxtApolloClientConfig.wsEndpoint,
    // Enable Automatic Query persisting with Apollo Engine
    persisting: false,
    // Use websockets for everything (no HTTP)
    // You need to pass a `wsEndpoint` for this to work
    websocketsOnly: false,
    // Is being rendered on the server?
    ssr: false,
    // Override default http link
    // link: myLink,
    // Override default cache
    // cache: myCache,
    // Additional ApolloClient options
    // apollo: { ... }
    getAuth: (tokenName) => {
      return ''
    }
  }, nuxtApolloOptions)

  const { apolloClient } = createApolloClient({
    ...defaultOptions,
    ...options
  })
  clients[key] = apolloClient

  return clients[key]
}

// Create the apollo client
function createApolloClient ({
  httpEndpoint,
  httpLinkOptions = {},
  wsEndpoint = null,
  uploadEndpoint = null,
  tokenName = 'apollo-token',
  persisting = false,
  ssr = false,
  websocketsOnly = false,
  link = null,
  cache = null,
  apollo = {},
  clientState = null,
  getAuth
}) {
  let wsClient, authLink, stateLink
  const disableHttp = websocketsOnly && !ssr && wsEndpoint

  // Apollo cache
  if (!cache) {
    cache = new InMemoryCache()
  }

  if (!disableHttp) {
    const httpLink = createUploadLink({
      fetch,
      uri: httpEndpoint,
      ...httpLinkOptions
    })

    if (!link) {
      link = httpLink
    }
    else {
      link = from([link, httpLink])
    }

    // HTTP Auth header injection
    authLink = setContext((_, { headers }) => {
      const authorization = getAuth(tokenName)
      const authorizationHeader = authorization ? { authorization } : {}
      return {
        headers: {
          ...headers,
          ...authorizationHeader
        }
      }
    })

    // Concat all the http link parts
    link = authLink.concat(link)
  }

  // On the server, we don't want WebSockets and Upload links
  if (!ssr) {
    // If on the client, recover the injected state
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-underscore-dangle
      const state = window.__APOLLO_STATE__
      if (state) {
        // If you have multiple clients, use `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }

    if (!disableHttp) {
      if (persisting) {
        link = createPersistedQueryLink().concat(link)
      }
    }

    // Web socket
    if (wsEndpoint) {
      wsClient = new SubscriptionClient(wsEndpoint, {
        reconnect: true,
        connectionParams: () => {
          const authorization = getAuth(tokenName)
          return authorization ? { authorization } : {}
        }
      })

      // Create the subscription websocket link
      const wsLink = new WebSocketLink(wsClient)

      if (disableHttp) {
        link = wsLink
      }
      else {
        link = split(
          // split based on operation type
          ({ query }) => {
            const { kind, operation } = getMainDefinition(query)
            return kind === 'OperationDefinition' &&
              operation === 'subscription'
          },
          wsLink,
          link
        )
      }
    }
  }

  if (clientState) {
    stateLink = withClientState({
      cache,
      ...clientState
    })
    link = from([stateLink, link])
  }

  const apolloClient = new ApolloClient({
    link,
    cache,
    // Additional options
    ...(ssr ? {
      // Set this on the server to optimize queries when SSR
      ssrMode: true
    } : {
      // This will temporary disable query force-fetching
      ssrForceFetchDelay: 100,
      // Apollo devtools
      connectToDevTools: process.env.NODE_ENV !== 'production'
    }),
    ...apollo
  })

  // Re-write the client state defaults on cache reset
  if (stateLink) {
    apolloClient.onResetStore(stateLink.writeDefaults)
  }

  return {
    apolloClient,
    wsClient,
    stateLink
  }
}
