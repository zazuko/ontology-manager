/* global cy */
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('should be available on homepage', () => {
    cy.contains('#sign-in', 'Sign In')
  })

  it('should log in from modal', () => {
    cy.contains('p', 'This document clarifies the terms under which you').should('not.be.visible')
    cy
      .get('#sign-in')
      .click()
    cy.contains('p', 'This document clarifies the terms under which you').should('be.visible')
    cy
      .get('#sign-in-from-modal')
      .click()
    cy.url().should('be', '/')
    cy.contains('p', 'This document clarifies the terms under which you').should('not.be.visible')
    cy.contains('#sign-out', 'Sign Out').should('be.visible')
  })
})
