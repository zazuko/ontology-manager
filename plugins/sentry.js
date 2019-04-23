export default ({ app }, inject) => {
  if (!process.SENTRY_DSN) {
    inject('sentry', { captureException })
  }
}

function captureException (error) {
  console.error(error)
}
