/* eslint-disable cypress/no-unnecessary-waiting */
/* global cy */

const collectResults = (result) => {
  const results = Cypress._
    .chain(result)
    .map('textContent')
    .map((x) => x.trim())
    .value()
    .slice(0, 5)
  return results.length
}

describe.only('Search', () => {
  before(() => {
    cy.visit('/')
  })

  it('should be available on homepage', () => {
    cy.get('#topbar-search').focus().wait(250).type('cargo', { delay: 75 }).focus()
    cy.wait(1500).get('.search-results a').then(collectResults).should('be.gte', 2)
    cy.get('#topbar-search').wait(250).clear()
    cy.get('h1.main-title').click()

    cy.get('#topbar-search').focus().wait(250).type('cargo weight', { delay: 75 }).focus()
    cy.wait(1500).get('.search-results a').then(collectResults).should('be.gte', 1)
    cy.get('#topbar-search').wait(250).clear()
    cy.get('h1.main-title').click()

    cy.get('#topbar-search').focus().wait(250).type('weight', { delay: 75 }).focus()
    cy.wait(1500).get('.search-results a').then(collectResults).should('be.gte', 3)
    cy.get('#topbar-search').wait(250).clear()
    cy.get('h1.main-title').click()
  })

  it('should close when input loses focus', () => {
    cy.get('#topbar-search').focus().wait(250).type('cargo', { delay: 75 })
    cy.get('h1.main-title').click()
    cy.wait(1500).get('.search-results').should('not.be.visible')
  })
})
