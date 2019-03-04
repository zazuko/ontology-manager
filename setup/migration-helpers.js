const _ = require('lodash')

function getConfigFromEnvVars () {
  let editorConfig
  try {
    editorConfig = JSON.parse(process.env.EDITOR_CONFIG)
  } catch (err) {
    editorConfig = {}
  }

  const editor = {
    loginStrategy: process.env.AUTH_STRATEGY || 'github',
    host: process.env.EDITOR_HOST || 'localhost:3000',
    protocol: process.env.EDITOR_PROTOCOL || 'http',
    meta: {
      title: _.get(editorConfig, 'head.title', 'Zazuko Ontology Editor Demo'),
      customerName: process.env.CUSTOMER_NAME || 'Zazuko GmbH',
      description: _.get(editorConfig, 'head.description', 'Linked Data Ontology Editor for Domain Specialists')
    },
    logoUrl: '/dcf-logo.svg',
    text: {
      home: [
        '<p>The Ontology Manager is based on a web interface and Github for repository functions. It has been created in order to enable collaboration on schema definition beyond the developer community and enabling the business process experts to engage and drive the creation of the best possible schema for the logistics industry, while ensuring a correct schema definition in Turtle (Terse RDF Triple Language) format.</p>',
        '<p>The Ontology Manager consists of the following functions; </p> <ul class="dash-bullet"> <li> repository of schema in Turtle format (Github) </li> <li> logical visualization of schema </li> <li> forum capability </li> <li> proposal, voting, and acceptance of new schema entries, changes, and deprecation </li> <li> search in all defined schemas </li> <li> activity list view </li> </ul> <p> In order to join you will need a Github account. </p>'
      ],
      login: `${process.env.CUSTOMER_NAME} uses GitHub as a collaboration platform for the ontology management. Therefore you require a GitHub account to collaborate on ${process.env.CUSTOMER_NAME}.`
    },
    github: {
      repo: _.get(editorConfig, 'github.repo', 'o'),
      owner: _.get(editorConfig, 'github.owner', 'vhf'),
      branch: _.get(editorConfig, 'github.branch', 'example-com')
    },
    committer: {
      name: _.get(editorConfig, 'committer.name', 'Ontology Editor'),
      email: _.get(editorConfig, 'committer.email', 'victor.felder@zazuko.com')
    }
  }

  const ontology = {
    datasetBaseUrl: process.env.DATASET_BASE_URL || 'http://example.com/',
    classBaseUrl: process.env.CLASS_BASE_URL || 'http://example.com/schema/',
    propertyBaseUrl: process.env.PROPERTY_BASE_URL || 'http://example.com/schema/',
    containersNestingPredicate: process.env.CONTAINERS_NESTING_PREDICATE || 'http://schema.org/hasPart',
    ontologyRawUrl: process.env.ONTOLOGY_RAW_URL || 'https://raw.githubusercontent.com/vhf/o/example-com/ontology.nt',
    structureRawUrl: process.env.STRUCTURE_RAW_URL || 'https://raw.githubusercontent.com/vhf/o/example-com/structure.nt'
  }

  const forge = {
    oauthHost: process.env.OAUTH_HOST || 'https://github.com/login/oauth',
    oauthClientId: process.env.OAUTH_CLIENT_ID || '',
    oauthClientSecret: process.env.OAUTH_CLIENT_SECRET || '',
    committerPersonalAccessToken: process.env.GITHUB_PERSONAL_ACCESS_TOKEN || ''
  }
  return { editor, forge, ontology }
}

module.exports = {
  getConfigFromEnvVars
}
