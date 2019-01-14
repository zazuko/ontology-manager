/* global cy */
describe('Login', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/admin/users')
  })
  it('should see myself in the list', () => {
    cy.contains('.admin-table', 'e2e test user')
  })
})
