const path = require('path')
const Trifid = require('trifid-core')
const express = require('express')

const app = express()

let middleware

initMiddleware()

// init middleware
async function initMiddleware () {
  if (!middleware) {
    middleware = await trifidMiddleware()
  }
}

app.use(async function (req, res, next) {
  if (!middleware) {
    initMiddleware()
  }
  middleware(req, res, next)
})

module.exports = { path: '/', handler: app }

async function trifidMiddleware () {
  const trifid = new Trifid()

  const config = {
    baseConfig: path.join(process.cwd(), 'trifid', 'trifid.config.json')
  }

  await trifid.init(config)

  return trifid.middleware()
}
