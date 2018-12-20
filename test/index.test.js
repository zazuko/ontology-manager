import { resolve } from 'path'
import { Nuxt, Builder } from 'nuxt'
import axios from 'axios'

const envInit = require('../setup/env-init')
// load env vars
envInit()

jest.setTimeout(60000)

// https://github.com/axios/axios/issues/960#issuecomment-320659373
axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.resolve(error.response)
)

// https://nuxtjs.org/guide/development-tools#end-to-end-testing
const getJSONLD = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'application/ld+json' } })
const getRDFXML = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'application/rdf+xml' } })
const getNT = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'application/n-triples' } })
const getTURTLE = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'text/turle' } })
const getHTML = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'text/html' } })

// We keep the nuxt and server instance
// So we can close them at the end of the test
let nuxt = null

// Init Nuxt.js and create a server listening on localhost:4000
describe('basic dev', () => {
  beforeAll(async () => {
    const config = {
      dev: true,
      rootDir: resolve(__dirname, '..'),
      ...require(resolve(__dirname, '../nuxt.config.js'))
    }
    nuxt = new Nuxt(config)
    await new Builder(nuxt).build()
    return nuxt.listen(3000, 'localhost')
  })

  // Close server and ask nuxt to stop listening to file changes
  afterAll(async () => {
    return nuxt.close()
  })

  test('render HTML', async () => {
    const context = {}
    const { html } = await nuxt.renderRoute('/', context)
    return expect(html).toContain('<!doctype html>')
  })

  describe('Route /', () => {
    test('html for html', async () => {
      const result = await getHTML('/')

      expect(result.status).toBe(200)
      return expect(result.data.toLowerCase()).toContain('<!doctype html>')
    })

    test('html for jsonld', async () => {
      const result = await getJSONLD('/')

      expect(result.status).toBe(200)
      expect(() => JSON.parse(result.data)).toThrow()

      return expect(result.data.toLowerCase()).toContain('<!doctype html>')
    })

    test('html for rdfxml', async () => {
      const result = await getRDFXML('/')

      expect(result.status).toBe(200)
      return expect(result.data.toLowerCase()).toContain('<!doctype html>')
    })

    test('html for nt', async () => {
      const result = await getNT('/')

      expect(result.status).toBe(200)
      return expect(result.data.toLowerCase()).toContain('<!doctype html>')
    })

    test('html for turtle', async () => {
      const result = await getTURTLE('/')

      expect(result.status).toBe(200)
      return expect(result.data.toLowerCase()).toContain('<!doctype html>')
    })
  })

  describe('Renders IRI from dataset wrt Accept header', () => {
    test('html for html', async () => {
      const result = await getHTML('/pouch/CargoHandlersPouch')

      expect(result.status).toBe(200)
      return expect(result.data.toLowerCase()).toContain('<!doctype html>')
    })

    test('jsonld in html', async () => {
      const result = await getHTML('/pouch/CargoHandlersPouch')

      expect(result.status).toBe(200)
      const found = result.data.match(/<script id="data" type="application\/ld\+json">([\s\S]+?)]<\/script>/m)
      return expect(found[1]).toMatchSnapshot()
    })

    test('json for jsonld', async () => {
      const result = await getJSONLD('/pouch/CargoHandlersPouch')

      expect(result.status).toBe(200)
      return expect(Object.keys(result.data)).toMatchSnapshot()
    })

    test('html for rdfxml', async () => {
      const result = await getRDFXML('/pouch/CargoHandlersPouch')

      // NotAcceptableError: no serializer found
      //   at ServerResponse.sendGraph [as graph] (ontology-editor/node_modules/rdf-body-parser/index.js:28:29)
      //   at rdfBodyParser.attach.then.then (ontology-editor/node_modules/trifid-handler-fetch/index.js:53:18)
      expect(result.status).toBe(406)
      return expect(result.data.toLowerCase()).toContain('<!doctype html>')
    })

    test('html for nt', async () => {
      const result = await getNT('/pouch/CargoHandlersPouch')

      expect(result.status).toBe(200)
      return expect(result.data).toMatchSnapshot()
    })

    test('html for turtle', async () => {
      const result = await getTURTLE('/pouch/CargoHandlersPouch')

      expect(result.status).toBe(404)
      return expect(result.data.toLowerCase()).toContain('<!doctype html>')
    })
  })

  describe('Renders 404 for IRI not in dataset', () => {
    test('html for html', async () => {
      const result = await getHTML('/pouch/CargoFOOBARPouch')

      return expect(result.status).toBe(404)
    })

    test('json for jsonld', async () => {
      const result = await getJSONLD('/pouch/CargoFOOBARPouch')

      return expect(result.status).toBe(404)
    })

    test('html for rdfxml', async () => {
      const result = await getRDFXML('/pouch/CargoFOOBARPouch')

      return expect(result.status).toBe(404)
    })

    test('html for nt', async () => {
      const result = await getNT('/pouch/CargoFOOBARPouch')

      return expect(result.status).toBe(404)
    })

    test('html for turtle', async () => {
      const result = await getTURTLE('/pouch/CargoFOOBARPouch')

      return expect(result.status).toBe(404)
    })
  })
})
