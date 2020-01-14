/* global cy */

const collectResults = (result) => {
  const results = Cypress._
    .chain(result)
    .map('textContent')
    .map((x) => x.trim())
    .value()
  cy.wrap(results).snapshot()
}

describe('Search', () => {
  before(() => {
    cy.visit('/')
  })

  it('should be available on homepage', () => {
    cy.get('#topbar-search').focus().type('cargo').focus()
    // cy.wait(1500).get('.search-results').should('be.visible')
    cy.get('.search-results a').then(collectResults)
    cy.get('#topbar-search').clear()

    cy.get('#topbar-search').focus().type('cargo weight').focus()
    // cy.wait(1500).get('.search-results').should('be.visible')
    cy.get('.search-results a').then(collectResults)
    cy.get('#topbar-search').clear()

    cy.get('#topbar-search').focus().type('weight').focus()
    // cy.wait(1500).get('.search-results').should('be.visible')
    cy.get('.search-results a').then(collectResults)
    cy.get('#topbar-search').clear()
  })

  it('should close when input loses focus', () => {
    cy.get('#topbar-search').focus().type('cargo').focus()
    // cy.wait(1500).get('.search-results').should('be.visible')
    cy.get('h1.main-title').click()
    cy.wait(1500).get('.search-results').should('not.be.visible')
  })
})
