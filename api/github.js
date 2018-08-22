const _ = require('lodash')
const Router = require('express').Router
const axios = require('axios')
const gql = require('graphql-tag')

module.exports = forgeApiFactory

function forgeApiFactory (config) {
  const localApolloClient = require('./getApolloClient')()
  // const githubApolloClient = require('./getApolloClient')({
  //   httpEndpoint: 'https://api.github.com/graphql',
  //   wsEndpoint: null,
  //   httpLinkOptions: {
  //     headers: {
  //       authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
  //     }
  //   }
  // })

  const router = Router()
  router.get('/', function (req, res, next) {
    res.send('Ontology Editor currently using GitHub')
  })

  router.post('/link', async function (req, res, next) {
    // our user got a token from github, now we need to ask github to whom this token belongs
    // and associate it to our user's account
    const {
      email: clientEmail,
      name: clientName,
      token: clientToken,
      id: clientId
    } = req.body

    const endpoint = `https://api.github.com/applications/${process.env.OAUTH_CLIENT_ID}/tokens/${clientToken}`
    const auth = {
      username: process.env.OAUTH_CLIENT_ID,
      password: process.env.OAUTH_CLIENT_SECRET
    }

    if (!auth.username || !auth.password) {
      res.status(500).send({message: 'Missing env vars!'})
      return
    }

    if (!clientToken) {
      res.status(500).send({message: 'Missing client token!'})
      return
    }

    let serverToken, serverId

    try {
      const result = await axios.get(endpoint, { auth })
      serverToken = result.data.token
      serverId = result.data.user.id

      // check that the client gave us the correct token
      if (!clientToken || clientToken !== serverToken) {
        throw new Error(`Bad tokens ${clientToken}, ${serverToken}`)
      }
      if (!clientId || clientId !== serverId) {
        throw new Error(`Bad IDs ${clientId}, ${serverId}`)
      }
    } catch (err) {
      res.status(404).send({message: err.message})
      return
    }

    const variables = {
      name: clientName,
      email: clientEmail,
      token: serverToken,
      providedId: serverId
    }

    try {
      await localApolloClient.mutate({
        mutation: gql`mutation ($name: String!, $email: String!, $token: String!, $providedId: Int!) {
          upsertPerson (input: {
            name: $name,
            email: $email,
            token: $token,
            providedId: $providedId
          }) {
            person {
              id
            }
          }
        }`,
        variables
      })

      // generate the user-specific JWT that Apollo will use to make authenticated
      // graphql queries for this user
      const result = await localApolloClient.mutate({
        mutation: gql`mutation ($oauthToken: String!, $oauthProvidedId: Int!) {
          authenticate (input: {
            oauthToken: $oauthToken,
            oauthProvidedId: $oauthProvidedId
          }) {
            jwtToken
          }
        }`,
        variables: {
          oauthToken: serverToken,
          oauthProvidedId: serverId
        }
      })

      if (!_.get(result, 'data.authenticate')) {
        throw new Error('Authentication failed.')
      }
      // data && data.authenticate
      res.json(result.data.authenticate)
      return
    } catch (err) {
      if (_.get(err, 'graphQLErrors.length', 0)) {
        console.error(err.graphQLErrors)
      } else {
        console.error(err)
      }
    }
    res.status(500).send()
  })

  return router
}
