const _ = require('lodash')
const debug = require('debug')('editor:backend')
const gql = require('graphql-tag')
const N3Parser = require('@rdfjs/parser-n3')
const rdf = require('rdf-ext')
const Router = require('express').Router
const stringToStream = require('string-to-stream')
const apolloClientFactory = require('../getApolloClient')
const FSAPI = require('./api')

const parser = new N3Parser({ factory: rdf })

module.exports = async function (editorConfig) {
  const router = Router()
  const api = new FSAPI(editorConfig)

  const ontologyFilename = editorConfig.ontology.ontologyRawUrl.substr(editorConfig.ontology.ontologyRawUrl.lastIndexOf('/') + 1)
  const structureFilename = editorConfig.ontology.structureRawUrl.substr(editorConfig.ontology.structureRawUrl.lastIndexOf('/') + 1)

  const filesCache = new Map()
  let version
  setInterval(async () => {
    for (const [path, content] of filesCache.entries()) {
      try {
        const newContent = await api.getFile({ path })
        if (newContent !== content) {
          filesCache.set(path, newContent)
        }
        if (typeof version === 'undefined' || newContent !== content) {
          const versionPart = newContent.split('\n').filter((line) => line.startsWith('_:')).join('\n')
          const quadStream = parser.import(stringToStream(versionPart))
          const dataset = await rdf.dataset().import(quadStream)
          const newVersion = getVersion(dataset)
          if (newVersion !== null) {
            version = newVersion
          }
          else if (typeof version === 'undefined') {
            version = -1
          }
        }
      }
      catch (err) {
        debug(err)
      }
    }
  }, 5000)

  const anonApolloClient = await apolloClientFactory()
  const getApolloClientForUser = async (req) => apolloClientFactory({
    user: req.user.person_id,
    token: req.get('Authorization'),
    getAuth: () => req.get('Authorization'),
    ssr: true
  })

  router.get('/', (req, res, next) => {
    res.send('Ontology Manager currently using E2E helpers')
  })

  router.get('/version', (req, res, next) => {
    res.json({ version })
  })

  router.post('/auth/login', (req, res, next) => {
    res.json({
      status: 'success',
      token: '222c3475226496afebcc295013eef94e6344d624'
    })
  })

  router.post('/auth/logout', (req, res, next) => {
    res.json(true)
  })

  router.get('/auth/user', (req, res, next) => {
    res.json({
      user: {
        name: 'e2e test user',
        login: 'e2e',
        id: 789,
        email: 'e2e@example.com'
      }
    })
  })

  router.get('/log', async (req, res, next) => {
    const content = await api.readLog()
    await api.clearLog()
    res.send(content)
  })

  router.get('/blob/:file', async (req, res) => {
    const path = req.params.file
    let content
    try {
      content = await api.getFile({ path })
      filesCache.set(path, content)
    }
    catch (err) {
      debug(`/blob/${path}`, err)
      res.status(500).send('error')
      return
    }
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

    let { token, avatarUrl, serverId } = {}

    try {
      ({ token, avatarUrl, serverId } = await checkToken(req, res))
    }
    catch (err) {
      debug(err)
    }
    if (!clientId || clientId !== serverId) {
      debug({ message: `Client-provided ID ${clientId} doesn't match server's one ${serverId}` })
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
        debug(err.graphQLErrors)
      }
      else {
        debug(err)
      }
    }

    res.status(500).send()
  })

  router.post('/proposal/submit', async (req, res, next) => {
    const { threadId, title, body, message, ontologyContent, structureContent } = req.body

    const author = { name: req.user.name, email: req.user.email }

    try {
      const { name: branch } = await api.createBranch()

      await api.updateFile({
        branch,
        author,
        message: `ontology: ${message}`,
        content: ontologyContent
      })
      if (structureContent) {
        await api.updateFile({
          branch,
          author,
          message: `structure: ${message}`,
          content: structureContent,
          structure: true
        })
      }

      const { number } = await api.createPR({ title, body, branch })
      console.log({ number })

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

      res.json(result.data)
    }
    catch (err) {
      console.error(err)
      res.status(500).json(err)
    }
  })

  router.post('/proposal/approve', async (req, res, next) => {
    const { threadId, number } = req.body

    try {
      const { success, message } = await api.mergePR({ number })

      if (!success) {
        throw new Error(`Merge failed: ${message}`)
      }

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
          newStatus: 'RESOLVED'
        }
      })

      res.json(result.data)
    }
    catch (err) {
      console.error(err)
      res.status(500).json(err)
    }
  })

  router.post('/proposal/close', async (req, res, next) => {
    const { threadId, number, status } = req.body

    if (!['resolved', 'hidden', 'rejected'].includes(status.toLowerCase())) {
      res.status(400).json(`Cannot set unknown status '${status}'`)
      return
    }

    if (number) {
      try {
        await api.closePR({ number })
      }
      catch (errorOctokit) {
        res.status(errorOctokit.code).json(errorOctokit)
        return
      }
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
      console.error(err)
      res.status(500).json(err)
    }
  })

  // TODO: factor these out
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

    return {
      token: bearerToken,
      serverId: 789,
      avatarUrl: 'https://www.gravatar.com/avatar/00000000000000000000000000000000'
    }
  }

  return router
}

function getVersion (dataset) {
  const quads = dataset.match(null, rdf.namedNode('http://schema.org/version')).toArray()
    .filter(({ subject, object }) => subject.termType === 'BlankNode' && object.termType === 'Literal')
  if (quads.length) {
    return parseInt(quads[0].object.value, 10)
  }
  return null
}
