export default async (context) => {
  if (process.client || process.browser) {
    Object.entries(context.env).forEach(([key, val]) => {
      process.env[key] = val
    })
  }
  if (process.browser) {
    await new Promise((resolve) => {
      setTimeout(async () => {
        await context.store.dispatch('nuxtClientInit', context)
        resolve()
      }, 0)
    })
  }
}
