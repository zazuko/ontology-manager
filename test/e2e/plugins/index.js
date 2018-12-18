// promisified fs module
const fs = require('fs')
const path = require('path')
const browserify = require('@cypress/browserify-preprocessor')

function getConfigurationByFile (file) {
  const pathToConfigFile = path.resolve(file)

  return fs.readFileSync(pathToConfigFile).toString()
}

function parseToJSON (content) {
  return content.split('\n')
    .reduce((obj, line) => {
      const [head, ...tail] = line.split('=')
      if (!tail.length) {
        return obj
      }
      obj[head] = tail.join('=')
      return obj
    }, {})
}

// plugins file
module.exports = (on, config) => {
  // accept a envFile value or use development by default
  const file = config.env.envFile || 'docker-app-dev/.env'

  const content = getConfigurationByFile(file)
  const envObj = parseToJSON(content)
  Object.entries(envObj).forEach((key, val) => {
    config.env[key] = val
  })

  const options = browserify.defaultOptions
  // print options to find babelify, it is inside transforms at index 1
  // and it is [filename, options]
  const babelOptions = options.browserifyOptions.transform[1][1]
  babelOptions.global = true
  // ignore all modules except files in lodash-es
  babelOptions.ignore = [/\/node_modules\/(?!@nuxtjs\/)/]
  // if you want to see the final options
  // console.log('%o', babelOptions)

  on('file:preprocessor', browserify(options))

  return config
}
