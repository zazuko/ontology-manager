/* global Cypress,cy */

Cypress.Commands.add('getProposalForm', () => {
  return cy.get('.layout-proposal')
})

Cypress.Commands.add('getFold', () => {
  return cy.get('div.fold')
})

Cypress.Commands.add('assertProposalTitle', (object, title, subform = false) => {
  if (!['class', 'prop'].includes(object)) {
    throw new Error('assertProposalTitle expects object{class, prop}, title')
  }
  if (subform) {
    cy.get(`.is-${object}-subform .title.is-2`).invoke('text').then(text => expect(text).to.contain(title))
  }
  else {
    cy.get(`.is-${object}-form .title.is-2`).invoke('text').then(text => expect(text).to.contain(title))
  }
})

Cypress.Commands.add('assertProposalIri', (object, iri, subform = false) => {
  if (!['class', 'prop'].includes(object)) {
    throw new Error('assertProposalIri expects object{class, prop}, iri')
  }
  if (subform) {
    cy.get(`.is-${object}-subform .subtitle.is-1 span.title-url`).should('contain', iri)
  }
  else {
    cy.get(`.is-${object}-form .subtitle.is-1 span.title-url`).should('contain', iri)
  }
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

Cypress.Commands.add('classTitleAndShortDesc', ({ scope, title, shortDesc, iriPart, depth = 0 }) => {
  cy.get(`${scope} .field.class-name input`).as('className')
  cy.get(`${scope} .field.class-name p.help.is-danger`).as('classHint')
  cy.getProgressionStep(3 + depth).should('not.have.class', 'done')
  cy.get('@className').clear()
  cy.get('@classHint').should('contain', 'Please enter the class name')
  cy.get('@className').type('lowercase')
  cy.get('@classHint').should('contain', 'Class name must start with an')
  cy.get('@className').clear().type(title)
  cy.get('@classHint').should('not.be.visible')
  cy.getProgressionStep(2 + depth).should('be', 'Enter New Class Details')
  cy.getProgressionStep(2 + depth).should('not.have.class', 'done')

  cy.get(`${scope} .field.short-description textarea`).as('shortDesc')
  cy.get(`${scope} .field.short-description p.help.is-danger`).as('shortDescHint')
  cy.get('@shortDescHint').should('contain', 'Please write a short description')
  cy.get('@shortDesc').type(shortDesc)
  cy.get('@shortDesc').clear()
  cy.get('@shortDescHint').should('contain', 'Please write a short description')
  cy.get('@shortDesc').type(shortDesc)
  cy.get('@shortDescHint').should('not.be.visible')
  cy.getProgressionStep(2 + depth).should('have.class', 'done')
  cy.getProgressionStep(2 + depth).should('contain', 'New Class')
  cy.getProgressionStep(2 + depth).find('span').eq(0).should('contain', title)
  cy.getProgressionStep(3 + depth).should('have.class', 'done')
  cy.assertProposalTitle('class', `New Class "${title}"`, depth > 0 ? 'subform' : false)
  cy.assertProposalIri('class', `http://example.com/schema/${iriPart}`, depth > 0 ? 'subform' : false)
  cy.getFold().should('be.visible')
})

Cypress.Commands.add('propertyTitleAndShortDesc', ({ scope, title, shortDesc, iriPart, depth = 0 }) => {
  cy.get(`${scope} .field.property-name input`).as('propName')
  cy.get(`${scope} .field.property-name p.help.is-danger`).as('propHint')
  cy.get('@propName').clear()
  cy.get('@propHint').should('contain', 'Please enter the property name')
  cy.get('@propName').clear().type(title)
  cy.get('@propHint').should('not.be.visible')
  cy.getProgressionStep(2 + depth).should('be', 'Enter New Property Details')
  cy.getProgressionStep(2 + depth).should('not.have.class', 'done')

  cy.get(`${scope} .field.short-description textarea`).as('shortDesc')
  cy.get(`${scope} .field.short-description p.help.is-danger`).as('shortDescHint')
  cy.get('@shortDescHint').should('contain', 'Please write a short description')
  cy.get('@shortDesc').type(shortDesc)
  cy.get('@shortDesc').clear()
  cy.get('@shortDescHint').should('contain', 'Please write a short description')
  cy.get('@shortDesc').type(shortDesc)
  cy.get('@shortDescHint').should('not.be.visible')
  cy.getProgressionStep(2 + depth).should('have.class', 'done')
  cy.getProgressionStep(2 + depth).should('contain', 'New Property')
  cy.getProgressionStep(2 + depth).find('span').eq(0).should('contain', title)
  cy.assertProposalTitle('prop', `New Property "${title}"`, depth > 0 ? 'subform' : false)
  cy.assertProposalIri('prop', `http://example.com/schema/${iriPart}`, depth > 0 ? 'subform' : false)
  cy.getFold().should('be.visible')
})
