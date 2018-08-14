import { resolve } from 'path'
import { Nuxt, Builder } from 'nuxt'
import { JSDOM } from 'jsdom'
import test from 'ava'

// We keep the nuxt and server instance
// So we can close them at the end of the test
let nuxt = null

// Init Nuxt.js and create a server listening on localhost:4000
test.before(async () => {
  const config = {
    dev: false,
    rootDir: resolve(__dirname, '..'),
    ...require(resolve(__dirname, '../nuxt.config.js'))
  }
  nuxt = new Nuxt(config)
  await new Builder(nuxt).build()
  await nuxt.listen(4000, 'localhost')
}, 30000)

// Example of testing only generated html
test('Route / exits and render HTML', async (t) => {
  const context = {}
  const { html } = await nuxt.renderRoute('/', context)
  t.true(html.includes('RDF'))
})

// Example of testing via dom checking
test('Route / exits and render HTML with CSS applied', async (t) => {
  const context = {}
  const { html } = await nuxt.renderRoute('/', context)
  const { window } = new JSDOM(html).window
  const element = window.document.querySelector('.signin button:last-child')
  t.not(element, null)
  t.is(element.textContent.trim(), 'Sign In')
  t.is(window.getComputedStyle(element).display, 'inline-block')
})

// Close server and ask nuxt to stop listening to file changes
test.after('Closing server and nuxt.js', (t) => {
  nuxt.close()
})
