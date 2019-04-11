const axios = require('axios')
const bodyParser = require('body-parser')

function assignDefaults (strategy, defaults) {
  Object.assign(strategy, Object.assign({}, defaults, strategy))
}

function addAuthorize (strategy) {
  // Get client_secret, client_id, token_endpoint and audience
  const clientSecret = strategy.client_secret
  const clientID = strategy.client_id
  const tokenEndpoint = strategy.token_endpoint
  const audience = strategy.audience

  // IMPORTANT: remove client_secret from generated bundle
  delete strategy.client_secret

  // Endpoint
  const endpoint = `/_auth/oauth/${strategy._name}/authorize`
  strategy.access_token_endpoint = endpoint

  // Set response_type to code
  strategy.response_type = 'code'

  // Form data parser
  const formMiddleware = bodyParser.urlencoded({ extended: true })

  // Register endpoint
  this.options.serverMiddleware.unshift({
    path: endpoint,
    handler: (req, res, next) => {
      if (req.method !== 'POST') {
        return next()
      }

      formMiddleware(req, res, () => {
        const {
          code,
          redirect_uri: redirectUri = strategy.redirect_uri,
          response_type: responseType = strategy.response_type
          // grant_type: grantType = strategy.grant_type
        } = req.body

        if (!code) {
          return next()
        }
        console.warn(JSON.stringify({
          method: 'post',
          url: tokenEndpoint,
          data: {
            client_id: clientID,
            client_secret: clientSecret,
            // grant_type: grantType,
            response_type: responseType,
            redirect_uri: redirectUri,
            audience: audience,
            code
          },
          headers: {
            Accept: 'application/json'
          }
        }, null, 2))

        try {
          axios
            .request({
              method: 'post',
              url: tokenEndpoint,
              data: {
                client_id: clientID,
                client_secret: clientSecret,
                // grant_type: grantType,
                response_type: responseType,
                redirect_uri: redirectUri,
                audience: audience,
                code
              },
              headers: {
                Accept: 'application/json'
              }
            })
            .then(response => {
              res.end(JSON.stringify(response.data))
            })
            .catch(error => {
              console.warn('A')
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
              }
              console.log(error.config);
              console.error(error)
              console.error(JSON.stringify(error))
              next(error)
            })
        } catch (error) {
          console.warn('B')
          console.error(error)
          console.error(JSON.stringify(error))
        }
      })
    }
  })
}

module.exports = {
  addAuthorize,
  assignDefaults
}
