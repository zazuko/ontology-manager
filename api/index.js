const jwt = require('express-jwt')
const bodyParser = require('body-parser')
const express = require('express')
const fetchConfig = require('../setup/fetch-config')

const app = express()

app.use(bodyParser.json({ limit: '4mb' }))

;(async () => {
  const editorConfig = await fetchConfig()

  /**
  Except when linking github oauth token with postgraphile JWT, all
  API requests that come through here need a valid postgraphile JWT
  */
  const ontologyFilename = editorConfig.ontology.ontologyRawUrl.substr(editorConfig.ontology.ontologyRawUrl.lastIndexOf('/') + 1)
  const structureFilename = editorConfig.ontology.structureRawUrl.substr(editorConfig.ontology.structureRawUrl.lastIndexOf('/') + 1)
  const filesRoutes = [ontologyFilename, structureFilename].map((file) => `/blob/${file}`)

  const unprotectedRoutes = ['', '/link', '/cache', '/auth/login', '/auth/logout', '/auth/user']
    .concat(filesRoutes)
    .reduce((routes, route) => {
      const path = `/api${route}`
      routes.push(path)
      // no smart trailing slash handling unfortunately
      routes.push(`${path}/`)
      return routes
    }, [])

  app.use(
    jwt({ secret: process.env.POSTGRAPHILE_TOKEN_SECRET }).unless({ path: unprotectedRoutes })
  )

  let api
  if (process.env.NODE_TEST) {
    api = 'e2e-helpers'
  }
  else if (editorConfig.editor.github) {
    api = 'github'
  }
  else if (editorConfig.editor.gitlab) {
    api = 'gitlab'
  }
  else {
    throw new Error('No forge API configured or configured forge API not found.')
  }
  console.warn(`Starting Editor for ${process.env.CUSTOMER_NAME} with ${api} support, config v${editorConfig.id}`)

  app.use('/', await require(`./${api}`)(editorConfig))
})()

module.exports = { path: '/api', handler: app }
