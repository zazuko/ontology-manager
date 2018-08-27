const _ = require('lodash')
const Router = require('express').Router
const axios = require('axios')
const gql = require('graphql-tag')
const {ontology} = require('../../nuxt.config')
const GitHubAPIv3 = require('./api')

const api = new GitHubAPIv3(ontology.github)

const router = Router()

module.exports = router

const localApolloClient = require('../getApolloClient')()
// const githubApolloClient = require('./getApolloClient')({
//   httpEndpoint: 'https://api.github.com/graphql',
//   wsEndpoint: null,
//   httpLinkOptions: {
//     headers: {
//       authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
//     }
//   }
// })

router.get('/', function (req, res, next) {
  res.send('Ontology Editor currently using GitHub')
})

router.post('/link', async function (req, res, next) {
  // our user got a token from github, now we need to ask github to whom this token belongs
  // and associate it to our user's account
  const {
    email: clientEmail,
    name: clientName,
    id: clientId
  } = req.body

  const {token, avatarUrl, serverId} = await checkToken(req, res)

  if (!clientId || clientId !== serverId) {
    res.status(500).send({message: `Client-provided ID ${clientId} doesn't match server's one`})
    return
  }

  const variables = {
    name: clientName,
    email: clientEmail,
    avatar: avatarUrl,
    providedId: clientId,
    token
  }

  try {
    await localApolloClient.mutate({
      mutation: gql`mutation ($name: String!, $email: String!, $avatar: String!, $token: String!, $providedId: Int!) {
        upsertPerson (input: {
          name: $name,
          email: $email,
          avatar: $avatar,
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
        oauthToken: token,
        oauthProvidedId: clientId
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

router.post('/proposals/new', async (req, res, next) => {
  // const {
  //   email: clientEmail,
  //   name: clientName,
  //   id: clientId
  // } = req.body
  try {
    const {name: branch} = await api.createBranch()
    await api.updateFile({
      message: 'hello',
      content: 'foobar test',
      branch,
      author: {
        name: req.user.name,
        email: req.user.email
      }
    })
    await api.createPR({
      title: 'my title',
      body: 'this **is** the body',
      branch
    })
    res.json('yay')
  } catch (err) {
    res.status(500).json(err)
  }
})

// TODO: factor these out
function getToken (req) {
  if (!req.headers.authorization) return

  const parts = req.headers.authorization.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
}

async function checkToken (req, res) {
  const bearerToken = getToken(req)
  if (!bearerToken) {
    res.status(500).send({message: 'Missing Bearer token!'})
    return false
  }

  const endpoint = `https://api.github.com/applications/${process.env.OAUTH_CLIENT_ID}/tokens/${bearerToken}`
  const auth = {
    username: process.env.OAUTH_CLIENT_ID,
    password: process.env.OAUTH_CLIENT_SECRET
  }

  if (!auth.username || !auth.password) {
    res.status(500).send({message: 'Missing env vars!'})
    return false
  }

  let serverToken
  let serverId
  let avatarUrl = ''

  try {
    const result = await axios.get(endpoint, { auth })
    serverToken = result.data.token
    serverId = result.data.user.id
    avatarUrl = result.data.user.avatar_url

    // check that the client gave us the correct token
    if (!bearerToken || bearerToken !== serverToken) {
      throw new Error(`Bearer token ${bearerToken} differs from the token GitHub gave us`)
    }
  } catch (err) {
    res.status(404).send({message: err.message})
    return false
  }

  return {
    token: serverToken,
    serverId,
    avatarUrl
  }
}
