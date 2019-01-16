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

        cy.classTitleAndShortDesc({
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
        cy.getProgressionStep(2).should('contain', 'Cargo bike')
        // title and iri got updated to Cargo bike
        cy.assertProposalTitle('class', 'New Class "Cargo bike"')
        cy.assertProposalIri('class', 'http://example.com/schema/CargoBike')

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
        cy.getProgressionStep(3).should('be', 'Enter New Property Details: Disco Wheel')

        cy.assertProposalTitle('prop', 'New Property "Disco Wheel"', 'subform')
        cy.assertProposalIri('prop', 'http://example.com/schema/discoWheel', 'subform')
        cy.propertyTitleAndShortDesc({
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
          cy.get('.collapsed-title').invoke('text').then(text => expect(text).to.contain('New Property "Disk Wheel"'))
          cy.get('.subform-reopen').click()
          cy.get('.property-details').should('exist')
        })
      })
    })
  })
})
