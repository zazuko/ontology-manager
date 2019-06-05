/*
source: https://github.com/fukuiretu/nuxt-healthcheck
author: fukuiretu <fukuiretu@gmail.com>
license: MIT
*/
const defaults = {
  path: '/healthcheck',
  contentType: 'text/plain',
  healthy: () => {
    return 'OK'
  }
}

module.exports = function healthcheck (moduleOptions) {
  const options = Object.assign({}, defaults, this.options.healthcheck, moduleOptions)

  this.addServerMiddleware({
    path: options.path,
    handler (req, res, next) {
      res.setHeader('Content-Type', options.contentType)
      res.end(options.healthy())
    }
  })
}
