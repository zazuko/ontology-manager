/* global cy */

describe('Proposal', () => {
  describe('on fallback', () => {
    beforeEach(() => {
      cy.visit('/').login()
      cy.visit('/pouch/CargoHandlersPouch')
    })

    it('should have one class', () => {
      cy.get('article.class-box').should('have.length', 1)
    })

    it('can request a new class', () => {
      cy.get('#proposal-new-class').click()
      cy.url().should('be', '/proposal/class?iri=http%3A%2F%2Fexample.com%2Fpouch%2FCargoHandlersPouch')
    })
  })

  describe('on object details', () => {
    beforeEach(() => {
      cy.visit('/').login()
      cy.visit('/schema/ShippersInstruction')
    })

    it('should have 5 properties', () => {
      cy.get('.properties-table > tbody > tr').should('have.length', 5)
    })

    it('can request a class modification', () => {
      cy.get('#proposal-change-object').click()
      cy.url().should('be', '/proposal/class?iri=http%3A%2F%2Fexample.com%2Fschema%2FShippersInstruction&edit=true')
    })

    it('can request a new property', () => {
      cy.get('#proposal-add-property').click()
      cy.url().should('be', '/proposal/property?iri=http%3A%2F%2Fexample.com%2Fschema%2FShippersInstruction')
    })
  })

  describe('create class proposal', () => {
    before(() => {
      cy.visit('/').login()
      cy.visit('/proposal/class?iri=http%3A%2F%2Fexample.com%2Fpouch%2FCargoHandlersPouch')
    })

    it('has a title and subtitle', () => {
      cy.getProposalForm().within(($form) => {
        cy.get('h1.title.is-1').should('contain', 'Request New Class')
        cy.get('h2.subtitle.is-1 > .title-url').should('contain', 'http://example.com/pouch/CargoHandlersPouch')

        // progression is zero
        cy.getProgressionStep(1).should('be', 'Enter a Motivation')
        cy.getProgressionStep(2).should('be', 'Enter New Class Details')
        cy.getProgressionStep(3).should('be', 'Finalize and Submit Proposal')
        cy.getProgressionSteps().should('have.length', 3)
        cy.getProgressionSteps('done').should('have.length', 0)

        // add motivation, it updates progression
        cy.get('#motivation textarea').type('My motivation')
        cy.getProgressionSteps('done').should('have.length', 1)
        cy.getProgressionSteps('todo').should('have.length', 2)

        // class name and short description
        cy.getFold().should('not.be.visible')
        cy.assertProposalTitle('class', 'New Class')
        cy.assertProposalIri('class', 'http://example.com/schema/')
        cy.get('.field.class-name p.help.is-danger').should('contain', 'Please enter the class name')
        cy.get('.field.class-name input').type('cargo bic')
        cy.get('.field.class-name p.help.is-danger').should('contain', 'Class name must start with an')
        cy.get('.field.class-name input').clear().type('Cargo bic')
        cy.get('.field.class-name p.help.is-danger').should('not.be.visible')
        cy.getProgressionStep(2).should('be', 'Enter New Class Details')
        cy.getProgressionStep(2).should('not.have.class', 'done')

        cy.get('.field.short-description p.help.is-danger').should('contain', 'Please write a short description')
        cy.get('.field.short-description textarea').type('This is a new class')
        cy.get('.field.short-description textarea').clear()
        cy.get('.field.short-description p.help.is-danger').should('contain', 'Please write a short description')
        cy.get('.field.short-description textarea').type('This is a new class')
        cy.get('.field.short-description p.help.is-danger').should('not.be.visible')
        cy.getProgressionStep(2).should('have.class', 'done')
        cy.getProgressionStep(2).should('contain', 'New Class')
        cy.getProgressionStep(2).find('span').eq(0).should('contain', 'Cargo bic')
        cy.assertProposalTitle('class', 'New Class "Cargo bic"')
        cy.assertProposalIri('class', 'http://example.com/schema/CargoBic')
        cy.getFold().should('be.visible')

        // adding properties to this new class
        cy.get('.properties-typeahead').within(() => {
          cy.get('input').type('fo')
          cy.get('.dropdown-item').should('have.length', 5)
          cy.get('input').type('o')
          cy.get('.dropdown-item').should('have.length', 3)
          cy.get('.dropdown-item').eq(2).should('contain', 'Footcandles')
          cy.get('input').type('o')
          cy.get('.dropdown-item').should('have.length', 2)
          cy.get('.dropdown-item').eq(1).should('contain', 'No result')
          cy.get('.dropdown-item').eq(1).should('be.visible')
          cy.get('input').clear().type('weight')
          // add prop netWeight
          cy.get('div.dropdown-item').eq(2).find('a').click()
        })

        cy.get('.properties-table tbody tr').find('td li a').eq(1).should('contain', 'CargoBic')
        cy.get('.properties-table tbody tr').find('td li a').eq(2).should('contain', 'Package')
        cy.get('.properties-table button').click()
        cy.get('.properties-table').should('not.exist')

        cy.get('.properties-typeahead').within(() => {
          // add prop netWeight
          cy.get('input').clear().type('weight')
          cy.get('.dropdown-item').eq(2).find('a').click()
        })
        cy.get('.properties-table').should('exist')

        // rename class Cargo bic to Cargo bike
        cy.get('.field.class-name input').type('{backspace}ke').wait(400)
        // prop table got updated to Cargo bike
        cy.get('.properties-table tbody tr').find('td li a').eq(1).should('contain', 'CargoBike')
        // progression got updated to Cargo bike
        cy.getProgressionStep(2).should('contain', 'Cargo bike')
        // title and iri got updated to Cargo bike
        cy.assertProposalTitle('class', 'New Class "Cargo bike"')
        cy.assertProposalIri('class', 'http://example.com/schema/CargoBike')
      })
    })
  })
})
