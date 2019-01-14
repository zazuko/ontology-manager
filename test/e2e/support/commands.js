/* global Cypress,cy */
require('@cypress/snapshot').register()

Cypress.Commands.add('login', () => {
  cy.visit('/')
  let $nuxt
  cy.window()
    .its('$nuxt')
    .then((_$nuxt) => {
      $nuxt = _$nuxt
      return $nuxt.$auth.loginWith('local')
    })
    .then(() => {
      return cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/link',
        headers: { authorization: $nuxt.$auth.getToken('local') },
        body: { email: 'e2e@example.com', name: 'e2e test user', id: 789, username: 'e2e' }
      })
    })
    .then((resp) => {
      const jwtToken = resp.body.jwtToken
      $nuxt.$auth.$storage.setState('isAdmin', resp.body.isAdmin)
      $nuxt.$auth.$storage.setState('personId', resp.body.personId)
      $nuxt.$auth.$storage.setState('hats', resp.body.personHats)
      $nuxt.$apolloHelpers.onLogin(jwtToken)
      $nuxt.$auth.$storage.setState('localUser', true)
    })
})
