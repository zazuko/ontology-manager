import snapshot from '@cypress/snapshot'
import './commands'
import './local-forge'

snapshot.register()

// we don't want "store reset while query was in flight" to trigger a test failure
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  if (err) {
    console.error(err)
  }
  return false
})
