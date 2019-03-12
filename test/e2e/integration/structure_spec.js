/* global cy */
const snapshotBoxes = (boxes) => {
  const boxesTitles = Cypress._
    .chain(boxes)
    .map('textContent')
    .map((x) => x.trim())
    .value()
  cy.wrap(boxesTitles).snapshot()
}

describe('Structure', () => {
  before(() => {
    cy.visit('/')
  })

  it('Shows all pouches on homepage', () => {
    cy.goto('/')
    cy.get('.class-box-title').then(snapshotBoxes)
  })

  it('Nests properly', () => {
    cy.goto('/letsnest/container/').wait(600)
    cy.get('.main-title').should('be', 'Container')
    cy.get('.class-box-title').then(snapshotBoxes)
    cy.goto('/letsnest/container/container/').wait(500)
    cy.get('.main-title').should('be', 'Deeper Container').wait(200)
    cy.get('.class-box-title').then(snapshotBoxes)
  })

  it('Loads a pouch', () => {
    cy.goto('/pouch/TrackUpdatePouch').wait(600)
    cy.get('.modal-loader').should('not.be.visible')
    cy.get('.main-title').should('be', 'Track Update Pouch')
    cy.get('.class-box-title').then(snapshotBoxes)
  })

  it('Navigates to a pouch', () => {
    cy.visit('/pouch/TrackUpdatePouch')
    cy.get('.class-box-title').then(snapshotBoxes)
  })
})
