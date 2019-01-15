/* global Cypress,cy */

let resp

Cypress.Commands.add('login', () => {
  let $nuxt
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
      $nuxt.$auth.$storage.setState('personId', resp.body.personId)
      $nuxt.$auth.$storage.setState('hats', resp.body.personHats)
      $nuxt.$apolloHelpers.onLogin(jwtToken)
      $nuxt.$auth.$storage.setState('localUser', true)
    })
})
