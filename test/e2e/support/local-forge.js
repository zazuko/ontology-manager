/* global Cypress,cy */

Cypress.Commands.add('readLogAndClear', (path) => {
  return cy.request({
    method: 'GET',
    url: 'http://localhost:3000/api/log'
  })
})
