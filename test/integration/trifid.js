import axios from 'axios'
import test from 'ava'

// https://github.com/axios/axios/issues/960#issuecomment-320659373
axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.resolve(error.response)
)

// https://nuxtjs.org/guide/development-tools#end-to-end-testing
const getHTML = (url) => axios.get(`http://localhost:3000${url}`)
const getJSONLD = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'application/ld+json' } })
const getNT = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'application/n-triples' } })
const getNQ = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'application/n-quads' } })
const getRDFXML = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'application/rdf+xml' } })
const getTURTLE = (url) => axios.get(`http://localhost:3000${url}`, { headers: { accept: 'text/turtle' } })

test('Route /, html for html', async (t) => {
  t.timeout(15000)
  const result = await getHTML('/')

  t.is(result.status, 200)
  t.true(result.data.toLowerCase().includes('<!doctype html>'))
})

test('Route /, html for jsonld', async (t) => {
  t.timeout(15000)
  const result = await getJSONLD('/')

  t.is(result.status, 200)
  t.throws(() => JSON.parse(result.data))

  t.true(result.data.toLowerCase().includes('<!doctype html>'))
})

test('Route /, html for rdfxml', async (t) => {
  t.timeout(15000)
  const result = await getRDFXML('/')

  t.is(result.status, 406)
})

test('Route /, html for nt', async (t) => {
  t.timeout(15000)
  const result = await getNT('/')

  t.is(result.status, 200)
  t.true(result.data.toLowerCase().includes('<!doctype html>'))
})

test('Route /, html for turtle', async (t) => {
  t.timeout(15000)
  const result = await getTURTLE('/')

  t.is(result.status, 200)
  t.true(result.data.toLowerCase().includes('<!doctype html>'))
})

test('Route /, html for nq', async (t) => {
  t.timeout(15000)
  const result = await getNQ('/')

  t.is(result.status, 406)
})

test('Renders IRI from dataset wrt Accept header: jsonld in html', async (t) => {
  t.timeout(15000)
  const result = await getHTML('/schema/FlightManifest')

  t.is(result.status, 200)

  const found = result.data.match(/type="application\/ld\+json" id="data">([\s\S]+?)]<\/script>/m)
  const jsonld = found[1] + ']'
  t.notThrows(() => JSON.parse(jsonld))
  t.true(jsonld.includes('{"@id":"http://localhost:3000/schema/FlightManifest","@type":"http://www.w3.org/2000/01/rdf-schema#Class"}'))
  t.is(JSON.parse(jsonld).filter((x) => x['@id'] === 'http://localhost:3000/schema/FlightManifest').length, 6)
})

test('Renders IRI from dataset wrt Accept header: html for html', async (t) => {
  t.timeout(15000)
  const result = await getHTML('/schema/FlightManifest')

  t.is(result.status, 200)
  t.true(result.data.toLowerCase().includes('<!doctype html>'))
})

test('Renders IRI from dataset wrt Accept header: json for jsonld', async (t) => {
  t.timeout(15000)
  const result = await getJSONLD('/schema/FlightManifest')

  t.is(result.status, 200)
  t.snapshot(Object.keys(result.data))
})

test('Renders IRI from dataset wrt Accept header: 406 for rdfxml', async (t) => {
  t.timeout(15000)
  const result = await getRDFXML('/schema/FlightManifest')
  t.is(result.status, 406)
})

test('Renders IRI from dataset wrt Accept header: nt for nt', async (t) => {
  t.timeout(15000)
  const result = await getNT('/schema/FlightManifest')

  t.is(result.status, 200)
  t.snapshot(result.data)
})

test('Renders IRI from dataset wrt Accept header: turtle for turtle', async (t) => {
  t.timeout(15000)
  const result = await getTURTLE('/schema/FlightManifest')
  t.is(result.status, 200)
  t.snapshot(result.data)
})

test('Renders IRI from dataset wrt Accept header: http406 for n-quads', async (t) => {
  t.timeout(15000)
  const result = await getNQ('/schema/FlightManifest')
  t.is(result.status, 406)
  t.is(result.data.toLowerCase(), 'no serializer for: "application/n-quads", available formats: "application/ld+json", "application/n-triples", "text/n3", "text/turtle", "application/json"')
})

test('Renders 404 for IRI not in dataset: html for html', async (t) => {
  t.timeout(15000)
  const result = await getHTML('/schema/...NOTHING...')

  t.is(result.status, 404)
})

test('Renders 404 for IRI not in dataset: json for jsonld', async (t) => {
  t.timeout(15000)
  const result = await getJSONLD('/schema/...NOTHING...')

  t.is(result.status, 404)
})

test('Renders 406 for IRI not in dataset: 406 for rdfxml', async (t) => {
  t.timeout(15000)
  const result = await getRDFXML('/schema/...NOTHING...')

  t.is(result.status, 406)
})

test('Renders 404 for IRI not in dataset: html for nt', async (t) => {
  t.timeout(15000)
  const result = await getNT('/schema/...NOTHING...')

  t.is(result.status, 404)
})

test('Renders 404 for IRI not in dataset: html for turtle', async (t) => {
  t.timeout(15000)
  const result = await getTURTLE('/schema/...NOTHING...')

  t.is(result.status, 404)
})
