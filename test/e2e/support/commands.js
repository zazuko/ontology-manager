/* global Cypress,cy */
import gql from 'graphql-tag'
let resp

Cypress.Commands.add('login', (path) => {
  let $nuxt
  cy.window().should('have.property', 'appReady', true)
  cy.window()
    .its('$nuxt')
    .then((_$nuxt) => {
      $nuxt = _$nuxt
      return $nuxt.$auth.loginWith('local')
    })
    .then(() => {
      if (resp) {
        return Promise.resolve(resp)
      }
      return cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/link',
        headers: { authorization: $nuxt.$auth.getToken('local') },
        body: { email: 'e2e@example.com', name: 'e2e test user', id: 789, username: 'e2e' }
      })
    })
    .then((_resp) => {
      resp = resp || _resp
      const jwtToken = resp.body.jwtToken
      $nuxt.$auth.$storage.setState('isAdmin', resp.body.isAdmin)
      $nuxt.$auth.$storage.setState('isSuperadmin', resp.body.isSuperadmin)
      $nuxt.$auth.$storage.setState('personId', resp.body.personId)
      $nuxt.$auth.$storage.setState('hats', resp.body.personHats)
      $nuxt.$apolloHelpers.onLogin(jwtToken)
      $nuxt.$auth.$storage.setState('localUser', true)
      if (path) {
        cy.goto(path)
      }
    })
})

Cypress.Commands.add('goto', (path) => {
  cy.window().should('have.property', 'appReady', true)
  cy.window()
    .its('$nuxt')
    .then(($nuxt) => {
      $nuxt.$router.push(path)
    })
})

Cypress.Commands.add('clearDrafts', () => {
  cy.window().should('have.property', 'appReady', true)
  cy.window()
    .its('$nuxt')
    .then(($nuxt) => {
      return new Promise((resolve) => setTimeout(() => {
        if ($nuxt.$store.state.drafts.drafts.length > 0) {
          cy.goto('/proposal/drafts')
          cy.get('table.table.admin-table .discard-draft').each(($button) => {
            cy.wrap($button).click()
          })
        }
        resolve()
      }, 500))
    })
})

Cypress.Commands.add('clearDrafts', () => {
  cy.countDrafts().then((count) => {
    if (count > 0) {
      cy.goto('/proposal/drafts')
      cy.get('table.table.admin-table .discard-draft').each(($button) => {
        cy.wrap($button).click()
      })
    }
  })
})

Cypress.Commands.add('countDrafts', () => {
  cy.window().should('have.property', 'appReady', true)
  return cy.window()
    .its('$nuxt')
    .then(($nuxt) => {
      return $nuxt.$apolloProvider.defaultClient.query({
        query: gql`query UserDrafts ($authorId: Int!) {
          proposals: allThreads (condition: {authorId: $authorId, threadType: PROPOSAL, isDraft: true, status: OPEN}) {
            drafts: nodes {
              id
            }
          }
        }`,
        variables: {
          authorId: $nuxt.$auth.$storage.getState('personId')
        },
        fetchPolicy: 'no-cache'
      })
    })
    .then((result) => {
      return result.data.proposals.drafts.length
    })
})

Cypress.Commands.add('countProposalsOn', (iri) => {
  cy.window().should('have.property', 'appReady', true)
  return cy.window()
    .its('$nuxt')
    .then(($nuxt) => {
      return $nuxt.$apolloProvider.defaultClient.query({
        query: gql`query AdminProposalList ($status: Status, $iri: String) {
          proposals: allThreads (
            condition: {
              threadType: PROPOSAL,
              isDraft: false,
              status: $status,
              iri: $iri
            }
          ) {
            nodes {
              id
            }
          }
        }
`,
        variables: {
          iri,
          status: 'OPEN'
        },
        fetchPolicy: 'no-cache'
      })
    })
    .then((result) => {
      return result.data.proposals.nodes.length
    })
})
