/* global cy */
describe('Admin Users List', () => {
  beforeEach(() => {
    cy.visit('/').login('/zom/admin/users').wait(1000)
  })
  it('should see myself in the list', () => {
    cy.contains('.admin-table', 'e2e test user')
  })
})
