const _ = require('lodash')
const axios = require('axios')
const debug = require('debug')('editor:backend')
const gql = require('graphql-tag')
const N3Parser = require('@rdfjs/parser-n3')
const rdf = require('rdf-ext')
const Router = require('express').Router
const stringToStream = require('string-to-stream')
const apolloClientFactory = require('../getApolloClient')
const GitHubAPIv3 = require('./api')
const { initMailer, sendMail, adminEmails } = require('../email')

const parser = new N3Parser({ factory: rdf })

let ontologyReloader

module.exports = async function (editorConfig) {
  // editorConfig is always the latest, full (private + public) config
  const router = Router()
  const api = new GitHubAPIv3(editorConfig)

  const filesCache = new Map()
  let ontologyVersion

  if (ontologyReloader) {
    clearInterval(ontologyReloader)
  }
  ontologyReloader = setInterval(async () => {
    const path = editorConfig.ontology.structureRawUrl.substr(editorConfig.ontology.structureRawUrl.lastIndexOf('/') + 1)
    const content = filesCache.get(path)
    try {
      const newContent = await api.getFile({ path })
      if (hash(newContent) !== content) {
        filesCache.set(path, hash(newContent))
      }
      if (typeof ontologyVersion === 'undefined' || newContent !== content) {
        const versionPart = newContent.split('\n').filter((line) => line.startsWith('_:')).join('\n')
        const quadStream = parser.import(stringToStream(versionPart))
        const dataset = await rdf.dataset().import(quadStream)
        const newVersion = getVersion(dataset)
        if (newVersion !== null) {
          ontologyVersion = newVersion
        }
        else if (typeof ontologyVersion === 'undefined') {
          ontologyVersion = -1
        }
      }
    }
    catch (err) {
      debug(err)
    }
  }, 5000)

  await initMailer(editorConfig)

  const anonApolloClient = await apolloClientFactory()
  const getApolloClientForUser = async (req) => apolloClientFactory({
    user: req.user.person_id,
    token: req.get('Authorization'),
    getAuth: () => req.get('Authorization'),
    ssr: true
  })

  router.get('/', (req, res, next) => {
    res.send('Ontology Manager currently using GitHub')
  })

  router.get('/version', (req, res, next) => {
    res.json({ version: ontologyVersion })
  })

  router.get('/blob/:file', async (req, res) => {
    const path = req.params.file
    let content
    try {
      content = await api.getFile({ path })
      filesCache.set(path, hash(content))
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

      const url = `${editorConfig.editor.protocol}://${editorConfig.editor.host}/zom/proposal/${threadId}`
      sendMail({
        recipients: await adminEmails(),
        subject: 'New proposal',
        text: dedent(`A proposal was created on "${editorConfig.editor.meta.title}".

          Proposal URL: ${url}
        `)
      })

      res.json(result.data)
    }
    catch (err) {
      if (_.get(err, 'request.headers.authorization')) {
        err.request.headers.authorization = '[...]'
      }
      debug(err.message, err.request)
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
      debug(err.message, err.request)
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
      debug(err.message, err.request)
      res.status(500).json({ message: err.message })
    }
  })

  router.post('/discussions/create', async (req, res, next) => {
    try {
      const userApolloClient = await getApolloClientForUser(req)

      const result = await userApolloClient.mutate({
        mutation: gql`
          mutation ($headline: String!, $body: String!, $iri: String!) {
            createThread (input: {
              thread: {
                headline: $headline,
                body: $body,
                iri: $iri,
                threadType: DISCUSSION,
                status: OPEN
              }
            }) {
              thread {
                id
              }
            }
          }`,
        variables: req.body
      })

      const url = `${editorConfig.editor.protocol}://${editorConfig.editor.host}/zom/discussion/${result.data.createThread.thread.id}`
      sendMail({
        recipients: await adminEmails(),
        subject: 'New discussion',
        text: dedent(`A discussion was created on "${editorConfig.editor.meta.title}".

          Title: ${req.body.headline}
          Discussion URL: ${url}
        `)
      })

      res.json(result.data)
    }
    catch (err) {
      if (_.get(err, 'request.headers.authorization')) {
        err.request.headers.authorization = '[...]'
      }
      debug(err.message, err.request)
      res.status(500).json({ message: err.message })
    }
  })

  router.post('/discussions/answer', async (req, res, next) => {
    try {
      const userApolloClient = await getApolloClientForUser(req)

      const result = await userApolloClient.mutate({
        mutation: gql`
          mutation ($threadId: Int!, $body: String!, $hatId: Int) {
            createMessage (input: {
              message: {
                threadId: $threadId,
                body: $body,
                hatId: $hatId
              }
            }) {
              message {
                id
              }
            }
          }`,
        variables: req.body
      })

      const url = `${editorConfig.editor.protocol}://${editorConfig.editor.host}/zom/discussion/${req.body.threadId}`
      sendMail({
        recipients: await adminEmails(),
        subject: 'New Answer',
        text: dedent(`An answer was posted on "${editorConfig.editor.meta.title}".

          Discussion URL: ${url}
        `)
      })

      res.json(result.data)
    }
    catch (err) {
      if (_.get(err, 'request.headers.authorization')) {
        err.request.headers.authorization = '[...]'
      }
      debug(err.message, err.request)
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

    const endpoint = `https://api.github.com/applications/${editorConfig.editor.github.oauthClientId}/token`
    const auth = {
      username: editorConfig.editor.github.oauthClientId,
      password: editorConfig.forge.oauthClientSecret
    }
    const headers = {
      Accept: 'application/vnd.github.v3+json'
    }

    if (!auth.username || !auth.password) {
      res.status(500).send({ message: 'Missing github config vars!' })
      return false
    }

    let serverToken
    let serverId
    let avatarUrl = ''

    try {
      const result = await axios.post(endpoint, { access_token: bearerToken }, { auth, headers })
      serverToken = result.data.token
      serverId = result.data.user.id
      avatarUrl = result.data.user.avatar_url

      // check that the client gave us the correct token
      if (!bearerToken || bearerToken !== serverToken) {
        const err = new Error(`Bearer token ${bearerToken} differs from the token GitHub gave us`)
        debug(err)
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

function getVersion (dataset) {
  const quads = dataset.match(null, rdf.namedNode('http://schema.org/version')).toArray()
    .filter(({ subject, object }) => subject.termType === 'BlankNode' && object.termType === 'Literal')
  if (quads.length) {
    return parseInt(quads[0].object.value, 10)
  }
  return null
}

const hash = (str) => str.split('').reduce((hash, char) => (((hash << 5) - hash) + char.charCodeAt(0)) | 0, 0).toString(16)

const dedent = (str) => str.split('\n').map(x => x.trimStart()).join('\n')
