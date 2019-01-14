/* global cy */
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('should be available on homepage', () => {
    cy.contains('#sign-in', 'Sign In')
  })

  it('should log in from modal', () => {
    cy.contains('p', 'you require a GitHub account to collaborate').should('not.be.visible')
    cy
      .get('#sign-in')
      .click()
    cy.contains('p', 'you require a GitHub account to collaborate').should('be.visible')
    cy
      .get('#sign-in-from-modal')
      .click()
    cy.url().should('be', '/')
    cy.contains('p', 'you require a GitHub account to collaborate').should('not.be.visible')
    cy.contains('#sign-out', 'Sign Out').should('be.visible')
  })
})
