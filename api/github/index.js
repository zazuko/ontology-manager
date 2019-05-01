const _ = require('lodash')
const Router = require('express').Router
const axios = require('axios')
const gql = require('graphql-tag')
const debug = require('debug')('editor:api')

const apolloClientFactory = require('../getApolloClient')
const GitHubAPIv3 = require('./api')

module.exports = async function (editorConfig) {
  const router = Router()
  const api = new GitHubAPIv3(editorConfig)

  const anonApolloClient = await apolloClientFactory()
  const getApolloClientForUser = async (req) => apolloClientFactory({
    user: req.user.person_id,
    token: req.get('Authorization'),
    getAuth: () => req.get('Authorization'),
    ssr: true
  })

  router.get('/', (req, res, next) => {
    res.send('Ontology Editor currently using GitHub')
  })

  router.get('/blob/:file', async (req, res, next) => {
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

    // console.log(`Linking attempt: ${JSON.stringify({ clientEmail, clientName, clientUsername, clientId })}`)

    let { token, avatarUrl, serverId } = {}

    try {
      ({ token, avatarUrl, serverId } = await checkToken(req, res))
    }
    catch (err) {
      console.error(err)
    }
    if (!clientId || clientId !== serverId) {
      console.error({ message: `Client-provided ID ${clientId} doesn't match server's one ${serverId}` })
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
          registerPerson (input: {
            name: $name,
            username: $username,
            email: $email,
            avatar: $avatar,
            token: $token,
            providedId: $providedId
          }) {
            person {
              id,
              isAdmin,
              isSuperadmin,
              hatPeopleByPersonId {
                nodes {
                  hatByHatId {
                    id,
                    title,
                    description
                  }
                }
              }
            }
          }
        }`,
        variables
      })
      const isAdmin = _.get(r, 'data.registerPerson.person.isAdmin')
      const isSuperadmin = _.get(r, 'data.registerPerson.person.isSuperadmin')
      const personId = _.get(r, 'data.registerPerson.person.id')
      const personHats = _
        .chain(r)
        .get('data.registerPerson.person.hatPeopleByPersonId.nodes', [])
        .map('hatByHatId')
        .value()

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
      result.data.authenticate.isSuperadmin = isSuperadmin
      result.data.authenticate.personId = personId
      result.data.authenticate.personHats = personHats
      res.json(result.data.authenticate)
      return
    }
    catch (err) {
      if (_.get(err, 'graphQLErrors.length', 0)) {
        console.error(err.graphQLErrors)
      }
      else {
        console.error(err)
      }
    }

    res.status(500).send()
  })

  router.post('/proposal/submit', async (req, res, next) => {
    const { threadId } = req.body

    try {
      const userApolloClient = await getApolloClientForUser(req)

      const result = await userApolloClient.mutate({
        mutation: gql`
          mutation ($threadId: Int!) {
            finalizeProposal (input: {
              threadId: $threadId
            }) {
              thread {
                id
              }
            }
          }`,
        variables: {
          threadId
        }
      })
      debug('/proposal/submit/: proposal finalized')

      res.json(result.data)
    }
    catch (err) {
      if (_.get(err, 'request.headers.authorization')) {
        err.request.headers.authorization = '[...]'
      }
      console.error(err.message, err.request)
      res.status(500).json({ message: err.message })
    }
  })

  router.post('/proposal/approve', async (req, res, next) => {
    const {
      threadId,
      message,
      ontologyContent,
      structureContent
    } = req.body

    try {
      const author = { name: req.user.name, email: req.user.email }
      const branch = editorConfig.editor.github.branch
      const commitLinks = []
      const ontologyCommit = await api.updateFile({
        branch,
        author,
        message: `ontology: ${message}`,
        content: ontologyContent
      })
      const commitLink = ontologyCommit.data.commit.html_url
      commitLinks.push(commitLink)
      debug(`/proposal/approve/: ontology committed ${commitLink}`)
      if (structureContent) {
        const structureCommit = await api.updateFile({
          branch,
          author,
          message: `structure: ${message}`,
          content: structureContent,
          structure: true
        })
        const commitLink = structureCommit.data.commit.html_url
        commitLinks.push(commitLink)
        debug(`/proposal/approve/: structure committed ${commitLink}`)
      }

      const userApolloClient = await getApolloClientForUser(req)
      await userApolloClient.mutate({
        mutation: gql`
          mutation ($threadId: Int!, $reference: String!) {
            updateExternalId (input: {
              threadId: $threadId,
              reference: $reference
            }) {
              thread {
                id
              }
            }
          }`,
        variables: {
          threadId: parseInt(threadId, 10),
          reference: commitLinks.join(' ')
        }
      })

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
    }
    catch (err) {
      debug(err)
      if (_.get(err, 'request.headers.authorization')) {
        err.request.headers.authorization = '[...]'
      }
      console.error(err.message, err.request)
      res.status(500).json({ message: err.message })
    }
  })

  router.post('/proposal/close', async (req, res, next) => {
    const { threadId, status } = req.body

    if (!['resolved', 'hidden', 'rejected'].includes(status.toLowerCase())) {
      res.status(400).json(`Cannot set unknown status '${status}'`)
      return
    }

    try {
      const userApolloClient = await getApolloClientForUser(req)

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
    }
    catch (err) {
      if (_.get(err, 'request.headers.authorization')) {
        err.request.headers.authorization = '[...]'
      }
      console.error(err.message, err.request)
      res.status(500).json({ message: err.message })
    }
  })

  function getToken (req) {
    if (!req.get('Authorization')) {
      return
    }

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

    const endpoint = `https://api.github.com/applications/${editorConfig.editor.github.oauthClientId}/tokens/${bearerToken}`
    const auth = {
      username: editorConfig.editor.github.oauthClientId,
      password: editorConfig.forge.oauthClientSecret
    }

    if (!auth.username || !auth.password) {
      res.status(500).send({ message: 'Missing github config vars!' })
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
        console.error(err)
        res.status(500).send({ message: err.message })
        return false
      }
    }
    catch (err) {
      res.status(404).send({ message: err.message })
      return false
    }

    return {
      token: serverToken,
      serverId,
      avatarUrl
    }
  }

  return router
}
