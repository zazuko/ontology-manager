const http = require('http')
const options = {
  host: 'localhost',
  port: 3000,
  timeout: 15 * 1000
}

const healthCheck = http.request(options, (res) => {
  console.log(`HEALTHCHECK STATUS: ${res.statusCode}`)
  if (res.statusCode === 200) {
    process.exit(0)
  }
  else {
    process.exit(1)
  }
})

healthCheck.on('error', (err) => {
  console.error(err.message)
  process.exit(1)
})

healthCheck.end()
