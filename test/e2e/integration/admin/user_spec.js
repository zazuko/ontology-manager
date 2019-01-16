/* global cy */
describe('Admin Users List', () => {
  beforeEach(() => {
    cy.visit('/').login('/admin/users')
  })
  it('should see myself in the list', () => {
    cy.contains('.admin-table', 'e2e test user')
  })
})
