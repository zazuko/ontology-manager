export default async (context) => {
  if (process.browser) {
    await new Promise((resolve) => {
      setTimeout(async () => {
        await context.store.dispatch('nuxtClientInit', context)
        resolve()
      }, 0)
    })
  }
}
