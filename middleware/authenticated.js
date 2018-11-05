export default function ({ app, error }) {
  const hasToken = !!app.$apolloHelpers.getToken()

  if (!hasToken) {
    error({ statusCode: 403, message: 'You are not allowed to see this' })
    return false
  }
}
