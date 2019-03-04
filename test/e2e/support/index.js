import snapshot from '@cypress/snapshot'
import './commands'

snapshot.register()

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  if (err) {
    console.error(err)
  }
  return false
})
