/* global cy */

describe('Proposal', () => {
  before(() => {
    cy.readLogAndClear()
  })

  describe('on fallback', () => {
    beforeEach(() => {
      cy.visit('/pouch/CargoHandlersPouch')
      cy.login()
      cy.clearDrafts()
      cy.goto('/pouch/CargoHandlersPouch')
    })

    it('should have one class', () => {
      cy.get('.class-boxes article.class-box').should('have.length', 1)
    })

    it('can request a new class', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000).get('#proposal-new-class').click()
      cy.url().should('be', '/zom/proposal/class?iri=http%3A%2F%2Fexample.com%2Fpouch%2FCargoHandlersPouch')
    })
  })

  describe('on object details', () => {
    beforeEach(() => {
      cy.visit('/schema/ShippersInstruction')
      cy.login()
      cy.clearDrafts().then(() => cy.goto('/schema/ShippersInstruction'))
    })

    it('should have 5 properties', () => {
      cy.get('.properties-table > tbody > tr').should('have.length', 5)
    })

    it('can request a class modification', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000).get('#proposal-change-object').click()
      cy.url().should('be', '/zom/proposal/class?iri=http%3A%2F%2Fexample.com%2Fschema%2FShippersInstruction&edit=true')
    })

    it('can request a new property', () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(3000).get('#proposal-add-property').click()
      cy.url().should('be', '/zom/proposal/property?iri=http%3A%2F%2Fexample.com%2Fschema%2FShippersInstruction')
    })
  })

  describe('create class proposal', () => {
    beforeEach(() => {
      cy.visit('/')
      cy.login()
      cy.clearDrafts().then(() => cy.goto('/zom/proposal/class?iri=http%3A%2F%2Fexample.com%2Fpouch%2FCargoHandlersPouch'))
    })

    it('saves a draft and discards it', () => {
      cy.get('.notification-counter').should('not.be.visible')

      createDraft()

      cy.get('.notification-counter').should('be.visible')
      cy.get('.notification-counter').should('contain', '1')

      cancelDraft()
      cy.get('.notification-counter').should('not.be.visible')
    })

    it('submits a proposal', () => {
      cy.get('.notification-counter').should('not.be.visible')

      createDraft()

      cy.get('.notification-counter').should('be.visible')
      cy.get('.notification-counter').should('contain', '1')

      cy.countProposalsOn('http://example.com/pouch/CargoHandlersPouch')
        .then((count) => {
          cy.url().should('include', 'http://localhost:3000/zom/proposal/class?id=')
          submitProposal().then(() => {
            cy.readLogAndClear().then((response) => {
              cy.wrap(response.body).snapshot()
            })
            cy.url().should('not.include', 'http://localhost:3000/zom/proposal/class?id=')
            cy.get('.notification-counter').should('not.be.visible')
            cy.goto('/pouch/CargoHandlersPouch').wait(3000)
            assertBoxesCountOn('/pouch/CargoHandlersPouch', { class: 1, proposal: count + 1 })
          })
        })
    })
  })
})

function submitProposal () {
  return cy.get('button.submit-proposal').click().wait(2000)
}

function cancelDraft () {
  cy.get('button.discard-proposal').click()
}

function createDraft () {
  getProposalForm().within(($form) => {
    cy.get('h1.title.is-1').should('contain', 'Request New Class')
    cy.get('h2.subtitle.is-1 > .title-url').should('contain', 'http://example.com/pouch/CargoHandlersPouch')

    // progression is zero
    getProgressionStep(1).should('be', 'Enter a Motivation')
    getProgressionStep(2).should('be', 'Enter New Class Details')
    getProgressionStep(3).should('be', 'Finalize and Submit Proposal')
    getProgressionSteps().should('have.length', 3)
    getProgressionSteps('done').should('have.length', 0)

    // add motivation, it updates progression
    cy.get('#motivation textarea').type('My motivation')
    getProgressionSteps('done').should('have.length', 1)
    getProgressionSteps('todo').should('have.length', 2)

    // class name and short description
    getFold().should('not.be.visible')
    assertProposalTitle('class', 'New Class')
    assertProposalIri('class', 'http://example.com/schema/')

    classTitleAndShortDesc({
      scope: '.is-class-form',
      title: 'Cargo bic',
      shortDesc: 'This is a new class',
      iriPart: 'CargoBic',
      depth: 0
    })

    // adding properties to this new class
    cy.get('.properties-typeahead').within(() => {
      cy.get('input').type('fo')
      cy.get('.dropdown-item.result-item').should('have.length', 3)
      cy.get('input').type('o')
      cy.get('.dropdown-item.result-item').should('have.length', 1)
      cy.get('.dropdown-item.result-item').should('contain', 'Footcandles')
      cy.get('input').type('o')
      cy.get('.dropdown-item.result-item').should('not.exist')
      cy.get('.dropdown-item.no-result').should('contain', 'No result')
      cy.get('.dropdown-item.no-result').should('be.visible')
      cy.get('.dropdown-item.create-property a').contains('"fooo"')
      cy.get('input').clear().type('weight')
      // add prop netWeight
      cy.get('div.dropdown-item.result-item a').eq(0).click()
      cy.get('input').should('be', '')
    })

    cy.get('.properties-table').within(() => {
      cy.get('tbody tr').find('td li a').eq(1).should('contain', 'CargoBic')
      cy.get('tbody tr').find('td li a').eq(2).should('contain', 'Package')
      cy.get('button').click()
    })
    cy.get('.properties-table').should('not.exist')

    cy.get('.properties-typeahead').within(() => {
      // add prop netWeight
      cy.get('input').clear().type('weight')
      cy.get('.dropdown-item.create-property a').contains('"weight"')
      cy.get('.dropdown-item.result-item a').eq(0).click()
      // selecting from the typeahead clears the input field
      cy.get('input').should('be', '')
    })
    cy.get('.properties-table').should('exist')

    // rename class Cargo bic to Cargo bike
    cy.get('.field.class-name input').type('{backspace}ke').trigger('change').wait(400)
    // prop table got updated to Cargo bike
    cy.get('.properties-table tbody tr').eq(0).within(() => {
      cy.get('.property-name').should('contain', 'netWeight')
      cy.get('.property-ranges').should('contain', 'double')
      cy.get('.property-used-on li').should('have.length', 2)
      cy.get('.property-used-on li').eq(0).should('contain', 'CargoBike')
      cy.get('.property-used-on li').eq(1).should('contain', 'Package')
      cy.get('.property-actions button').should('have.length', 1)
      cy.get('.property-actions button').should('contain', 'Remove')
    })
    // progression got updated to Cargo bike
    getProgressionStep(2).should('contain', 'Cargo bike')
    // title and iri got updated to Cargo bike
    assertProposalTitle('class', 'New Class "Cargo bike"')
    assertProposalIri('class', 'http://example.com/schema/CargoBike')

    // we now want to create a new property from this class proposal
    cy.get('.properties-typeahead').within(() => {
      // add prop netWeight
      cy.get('input').clear().type('Disco Wheel')
      cy.get('.dropdown-item.create-property a').contains('"Disco Wheel"')
      cy.get('.dropdown-item.create-property a').eq(0).click()
      cy.get('input').should('be', '')
    })

    cy.get('.properties-table tbody tr').eq(1).within(() => {
      cy.get('.property-name').should('contain', 'Disco Wheel')
      cy.get('.property-ranges').should('be', '')
      cy.get('.property-used-on li').should('have.length', 1)
      cy.get('.property-used-on li').should('contain', 'CargoBike')
      cy.get('.property-actions button').should('have.length', 1)
      cy.get('.property-actions button').should('contain', 'Remove')
      cy.get('.property-actions a').should('contain', 'Edit')
    })
    getProgressionStep(3).should('be', 'Enter New Property Details: Disco Wheel')

    assertProposalTitle('prop', 'New Property "Disco Wheel"', 'subform')
    assertProposalIri('prop', 'http://example.com/schema/discoWheel', 'subform')
    propertyTitleAndShortDesc({
      scope: '.is-prop-subform',
      title: 'Disk Wheel',
      shortDesc: 'This is a new property',
      iriPart: 'diskWheel',
      depth: 1
    })
    cy.get('.is-prop-subform.is-subform').within(() => {
      cy.get('.subform-submit').invoke('text').then(text => expect(text).to.contain('Add "Disk Wheel" to the proposal'))
      cy.get('.subform-submit').click()
      cy.get('.property-details').should('not.exist')
      cy.get('.collapsed-title').wait(3000).invoke('text').then(text => expect(text).to.contain('New Property "Disk Wheel"'))
      cy.get('.subform-reopen').click()
      cy.get('.property-details').should('exist')
    })
  })
}

function getProposalForm () {
  return cy.get('.layout-proposal')
}

function getFold () {
  return cy.get('div.fold')
}

function assertProposalTitle (object, title, subform = false) {
  if (!['class', 'prop'].includes(object)) {
    throw new Error('assertProposalTitle expects object{class, prop}, title')
  }
  if (subform) {
    cy.get(`.is-${object}-subform .title.is-2`).invoke('text').then(text => expect(text).to.contain(title))
  }
  else {
    cy.get(`.is-${object}-form .title.is-2`).invoke('text').then(text => expect(text).to.contain(title))
  }
}

function assertProposalIri (object, iri, subform = false) {
  if (!['class', 'prop'].includes(object)) {
    throw new Error('assertProposalIri expects object{class, prop}, iri')
  }
  if (subform) {
    cy.get(`.is-${object}-subform .subtitle.is-1 span.title-url`).should('contain', iri)
  }
  else {
    cy.get(`.is-${object}-form .subtitle.is-1 span.title-url`).should('contain', iri)
  }
}

function getProgressionStep (n) {
  // this command lets us use the 'natural' step 1-based numbering
  // instead of zero-based
  return cy.get('ul.progression-steps').find('li').eq(n - 1)
}

function getProgressionSteps (status) {
  switch (status) {
    case 'todo':
      return cy.get('ul.progression-steps li:not(.done)')
    case 'done':
      return cy.get('ul.progression-steps li.done')
  }
  return cy.get('ul.progression-steps li')
}

function classTitleAndShortDesc ({ scope, title, shortDesc, iriPart, depth = 0 }) {
  cy.get(`${scope} .field.class-name input`).as('className')
  cy.get(`${scope} .field.class-name p.help.is-danger`).as('classHint')
  getProgressionStep(3 + depth).should('not.have.class', 'done')
  cy.get('@className').clear()
  cy.get('@classHint').should('contain', 'Please enter the class name')
  cy.get('@className').type('lowercase')
  cy.get('@classHint').should('contain', 'Class name must start with an')
  cy.get('@className').clear().type(title)
  cy.get('@classHint').should('not.be.visible')
  getProgressionStep(2 + depth).should('be', 'Enter New Class Details')
  getProgressionStep(2 + depth).should('not.have.class', 'done')

  cy.get(`${scope} .field.short-description textarea`).as('shortDesc')
  cy.get(`${scope} .field.short-description p.help.is-danger`).as('shortDescHint')
  cy.get('@shortDescHint').should('contain', 'Please write a short description')
  cy.get('@shortDesc').type(shortDesc)
  cy.get('@shortDesc').clear()
  cy.get('@shortDescHint').should('contain', 'Please write a short description')
  cy.get('@shortDesc').type(shortDesc)
  cy.get('@shortDescHint').should('not.be.visible')
  getProgressionStep(2 + depth).should('have.class', 'done')
  getProgressionStep(2 + depth).should('contain', 'New Class')
  getProgressionStep(2 + depth).find('span').eq(0).should('contain', title)
  getProgressionStep(3 + depth).should('have.class', 'done')
  assertProposalTitle('class', `New Class "${title}"`, depth > 0 ? 'subform' : false)
  assertProposalIri('class', `http://example.com/schema/${iriPart}`, depth > 0 ? 'subform' : false)
  getFold().should('be.visible')
}

function propertyTitleAndShortDesc ({ scope, title, shortDesc, iriPart, depth = 0 }) {
  cy.get(`${scope} .field.property-name input`).as('propName')
  cy.get(`${scope} .field.property-name p.help.is-danger`).as('propHint')
  cy.get('@propName').clear()
  cy.get('@propHint').should('contain', 'Please enter the property name')
  cy.get('@propName').clear().type(title)
  cy.get('@propHint').should('not.be.visible')
  getProgressionStep(2 + depth).should('be', 'Enter New Property Details')
  getProgressionStep(2 + depth).should('not.have.class', 'done')

  cy.get(`${scope} .field.short-description textarea`).as('shortDesc')
  cy.get(`${scope} .field.short-description p.help.is-danger`).as('shortDescHint')
  cy.get('@shortDescHint').should('contain', 'Please write a short description')
  cy.get('@shortDesc').type(shortDesc)
  cy.get('@shortDesc').clear()
  cy.get('@shortDescHint').should('contain', 'Please write a short description')
  cy.get('@shortDesc').type(shortDesc)
  cy.get('@shortDescHint').should('not.be.visible')
  getProgressionStep(2 + depth).should('have.class', 'done')
  getProgressionStep(2 + depth).should('contain', 'New Property')
  getProgressionStep(2 + depth).find('span').eq(0).should('contain', title)
  assertProposalTitle('prop', `New Property "${title}"`, depth > 0 ? 'subform' : false)
  assertProposalIri('prop', `http://example.com/schema/${iriPart}`, depth > 0 ? 'subform' : false)
  getFold().should('be.visible')
}

function assertBoxesCountOn (path, counts) {
  cy.goto(path)
  cy.get('.class-boxes article.class-box').should('have.length', counts.class)
  cy.get('.proposal-boxes article.class-box').should('have.length', counts.proposal)
}
