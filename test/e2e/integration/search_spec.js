/* global cy */
describe('Search', () => {
  it('should be available on homepage', () => {
    cy.visit('/')
    cy.get('#topbar-search').type('cargo').wait(100)
    cy.get('.search-results').snapshot()
    cy.get('#topbar-search').clear()

    cy.get('#topbar-search').type('cargo weight').wait(100)
    cy.get('.search-results').snapshot()
    cy.get('#topbar-search').clear()

    cy.get('#topbar-search').type('weight').wait(100)
    cy.get('.search-results').snapshot()
    cy.get('#topbar-search').clear()
  })
})
