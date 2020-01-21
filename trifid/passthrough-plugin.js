const serializersFor = [
  'application/ld+json',
  'application/n-triples',
  'text/n3',
  'text/turtle',
  'application/json'
]

module.exports = function handler (router) {
  router.use((req, res, next) => {
    if ('iri' in req) {
      req._iri = req.iri
    }
    const accepted = req.get('Accept') || ''
    if (req.accepts(['html', 'xhtml+xml', 'xml'])) {
      if (accepted.includes('*/*')) {
        const filtered = accepted.split(',').filter(str => !str.includes('*/*')).join(',')
        // need to use lowercase key!
        req.headers.accept = filtered
      }
      // disables trifid serialization because this iri won't be found in the datasets
      req.iri = '… nothing here …'
    }
    else if (!req.accepts(serializersFor)) {
      res.status(406).send(`No serializer for: "${accepted}", available formats: "${serializersFor.join('", "')}"`)
      return
    }

    next()
  })
}
