export default async (context) => {
  if (process.browser) {
    await context.store.dispatch('nuxtClientInit', context)
    setInterval(() => {
      context.store.dispatch('graph/RELOAD_DATASET')
    }, 10000)
  }
}
