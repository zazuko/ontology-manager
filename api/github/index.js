const _ = require('lodash')
const Router = require('express').Router
const axios = require('axios')
const apicache = require('apicache')
const gql = require('graphql-tag')
const ontology = require('../../ontology.config')
const apolloClientFactory = require('../getApolloClient')
const GitHubAPIv3 = require('./api')

const router = Router()

module.exports = router

const api = new GitHubAPIv3(ontology.github)
const onlyStatus200 = (req, res) => res.statusCode === 200
const cache = (duration) => apicache.middleware(duration, onlyStatus200)

const anonApolloClient = apolloClientFactory()
const getAuthenticatedApolloClient = (token) => apolloClientFactory({
  getAuth: () => token,
  ssr: true
})
// const githubApolloClient = apolloClientFactory({
//   httpEndpoint: 'https://api.github.com/graphql',
//   wsEndpoint: null,
//   httpLinkOptions: {
//     headers: {
//       authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
//     }
//   }
// })

router.get('/', (req, res, next) => {
  res.send('Ontology Editor currently using GitHub')
})

router.get('/blob/:branch/:file', cache('5 minutes'), async (req, res, next) => {
  const path = req.params.file
  const branch = req.params.branch
  const content = await api.getFile({ path, branch })
  res.type('application/n-triples')

  res.send(content)
})

router.get('/blob/:file', cache('5 minutes'), async (req, res, next) => {
  req.apicacheGroup = 'files'
  const path = req.params.file
  const content = await api.getFile({ path })
  res.type('application/n-triples')

  res.send(content)
})

router.post('/link', async (req, res, next) => {
  // This is (`/` aside) the only endpoint that does not require a valid JWT.
  // We use this when our user got a token from github, and now need to ask
  // github to whom this token belongs and associate it to our user's account
  const {
    email: clientEmail,
    name: clientName,
    username: clientUsername,
    id: clientId
  } = req.body

  const { token, avatarUrl, serverId } = await checkToken(req, res)

  if (!clientId || clientId !== serverId) {
    res.status(500).send({ message: `Client-provided ID ${clientId} doesn't match server's one` })
    return
  }

  const variables = {
    name: clientName,
    username: clientUsername,
    email: clientEmail,
    avatar: avatarUrl,
    providedId: clientId,
    token
  }

  try {
    const r = await anonApolloClient.mutate({
      mutation: gql`mutation ($name: String!, $username: String!, $email: String!, $avatar: String!, $token: String!, $providedId: Int!) {
        upsertPerson (input: {
          name: $name,
          username: $username,
          email: $email,
          avatar: $avatar,
          token: $token,
          providedId: $providedId
        }) {
          person {
            id,
            isAdmin
          }
        }
      }`,
      variables
    })
    const isAdmin = _.get(r, 'data.upsertPerson.person.isAdmin')

    // generate the user-specific JWT that Apollo will use to make authenticated
    // graphql queries for this user
    const result = await anonApolloClient.mutate({
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
    result.data.authenticate.isAdmin = isAdmin
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

router.post('/proposal/new', async (req, res, next) => {
  const { title, body, message, content, iri } = req.body

  const author = { name: req.user.name, email: req.user.email }

  try {
    const { name: branch } = await api.createBranch()

    await api.updateFile({ message, content, branch, author })

    const { number } = await api.createPR({ title, body, branch })

    const userApolloClient = getAuthenticatedApolloClient(_.get(req, 'headers.authorization'))

    const result = await userApolloClient.mutate({
      mutation: gql`
        mutation ($headline: String!, $body: String!, $iri: String!, $externalId: Int!, $threadType: ThreadType!) {
          createThread (input: {
            thread: {
              headline: $headline,
              body: $body,
              iri: $iri,
              externalId: $externalId,
              threadType: $threadType
            }
          }) {
            thread {
              id
            }
          }
        }
      `,
      variables: {
        iri,
        body,
        headline: title,
        externalId: number,
        threadType: 'PROPOSAL'
      }
    })

    res.json(result.data)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.post('/proposal/merge', async (req, res, next) => {
  apicache.clear('files')
  const { threadId, number } = req.body

  try {
    const { success, message } = await api.mergePR({ number })

    if (!success) {
      throw new Error(`Merge failed: ${message}`)
    }

    const userApolloClient = getAuthenticatedApolloClient(_.get(req, 'headers.authorization'))

    const result = await userApolloClient.mutate({
      mutation: gql`
      mutation ($threadId: Int!, $newStatus: Status!) {
        changeThreadStatus (input: {
          threadId: $threadId,
          newStatus: $newStatus
        }) {
          thread {
            id
          }
        }
      }`,
      variables: {
        threadId: parseInt(threadId, 10),
        newStatus: 'RESOLVED'
      }
    })

    res.json(result.data)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.post('/proposal/close', async (req, res, next) => {
  apicache.clear('files')
  const { threadId, number, status } = req.body

  try {
    if (!['resolved', 'hidden'].includes(status.toLowerCase())) {
      throw new Error(`Cannot set unknown status '${status}'`)
    }

    await api.closePR({ number })

    const userApolloClient = getAuthenticatedApolloClient(_.get(req, 'headers.authorization'))

    const result = await userApolloClient.mutate({
      mutation: gql`
      mutation ($threadId: Int!, $newStatus: Status!) {
        changeThreadStatus (input: {
          threadId: $threadId,
          newStatus: $newStatus
        }) {
          thread {
            id
          }
        }
      }`,
      variables: {
        threadId: parseInt(threadId, 10),
        newStatus: status.toUpperCase()
      }
    })

    res.json(result.data)
  } catch (err) {
    res.status(500).json(err)
  }
})

// TODO: factor these out
function getToken (req) {
  if (!_.get(req, 'headers.authorization')) return

  const parts = req.headers.authorization.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }
  throw new Error('Failed to extract auth token')
}

async function checkToken (req, res) {
  const bearerToken = getToken(req)
  if (!bearerToken) {
    res.status(500).send({ message: 'Missing Bearer token!' })
    return false
  }

  const endpoint = `https://api.github.com/applications/${process.env.OAUTH_CLIENT_ID}/tokens/${bearerToken}`
  const auth = {
    username: process.env.OAUTH_CLIENT_ID,
    password: process.env.OAUTH_CLIENT_SECRET
  }

  if (!auth.username || !auth.password) {
    res.status(500).send({ message: 'Missing env vars!' })
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
      const err = new Error(`Bearer token ${bearerToken} differs from the token GitHub gave us`)
      res.status(500).send({ message: err.message })
      return false
    }
  } catch (err) {
    res.status(404).send({ message: err.message })
    return false
  }

  return {
    token: serverToken,
    serverId,
    avatarUrl
  }
}
