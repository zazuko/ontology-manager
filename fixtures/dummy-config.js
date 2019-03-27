module.exports = () => ({
  version: 0,
  editor: {
    setup: 'step1',
    loginStrategy: 'github',
    host: 'localhost:3000',
    protocol: 'http',
    meta: {
      title: 'ACME Ontology Editor',
      customerName: 'ACME',
      description: 'Linked Data Ontology Editor for Domain Specialists'
    },
    logoUrl: '/zazuko-logo.png',
    text: {
      home: [''],
      login: 'ACME uses GitHub as a collaboration platform for the ontology management. Therefore you require a GitHub account to collaborate.',
      groupName: 'Container'
    },
    github: {
      repo: '',
      owner: '',
      branch: '',
      oauthClientId: '%%OAUTH_CLIENT_ID%%'
    },
    committer: {
      name: '',
      email: ''
    }
  },
  ontology: {
    datasetBaseUrl: 'http://example.com/',
    classBaseUrl: 'http://example.com/schema/',
    propertyBaseUrl: 'http://example.com/schema/',
    containersNestingPredicate: 'http://schema.org/hasPart',
    ontologyRawUrl: 'file:./fixtures/empty.nt',
    structureRawUrl: 'file:./fixtures/empty.nt',
    ontologyResourceUrl: '/'
  },
  forge: {
    oauthHost: 'https://github.com/login/oauth',
    oauthClientSecret: '%%OAUTH_CLIENT_SECRET%%',
    committerPersonalAccessToken: '%%COMMITTER_PERSONAL_ACCESS_TOKEN%%'
  }
})
