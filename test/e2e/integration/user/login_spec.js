/* global cy */
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('should be available on homepage', () => {
    cy.contains('#sign-in', 'Sign In')
  })
})
