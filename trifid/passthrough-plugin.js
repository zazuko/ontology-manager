module.exports = function handler (router) {
  router.use((req, res, next) => {
    if ('iri' in req) {
      req._iri = req.iri
    }
    if (req.accepts(['html', 'xhtml+xml', 'xml'])) {
      const accepted = req.get('Accept') || []
      if (accepted.includes('*/*')) {
        const filtered = accepted.split(',').filter(str => !str.includes('*/*')).join(',')
        // need to use lowercase key!
        req.headers.accept = filtered
      }
      req.iri = '… nothing here …'
    }

    next()
  })
}
