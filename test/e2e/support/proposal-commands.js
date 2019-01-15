/* global Cypress,cy */

Cypress.Commands.add('getProposalForm', () => {
  return cy.get('.layout-proposal')
})

Cypress.Commands.add('getFold', () => {
  return cy.get('div.fold')
})

Cypress.Commands.add('assertProposalTitle', (object, title) => {
  if (!['class', 'prop'].includes(object)) {
    throw new Error('assertProposalTitle expects object{class, prop}, title')
  }
  cy.get(`.is-${object}-form .title.is-2`).invoke('text').then(text => expect(text).to.contain(title))
})

Cypress.Commands.add('assertProposalIri', (object, iri) => {
  if (!['class', 'prop'].includes(object)) {
    throw new Error('assertProposalIri expects object{class, prop}, iri')
  }
  cy.get(`.is-${object}-form .subtitle.is-1 span.title-url`).should('be', iri)
})

Cypress.Commands.add('getProgressionStep', (n) => {
  // this command lets us use the 'natural' step 1-based numbering
  // instead of zero-based
  return cy.get('ul.progression-steps').find('li').eq(n - 1)
})

Cypress.Commands.add('getProgressionSteps', (status) => {
  switch (status) {
    case 'todo':
      return cy.get('ul.progression-steps li:not(.done)')
    case 'done':
      return cy.get('ul.progression-steps li.done')
  }
  return cy.get('ul.progression-steps li')
})
