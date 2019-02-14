export default ({ app, store }, inject) => {
  inject('headTitle', headTitle)

  function headTitle (title) {
    return `${title} - ${store.state.config.editor.meta.title}`
  }
}
