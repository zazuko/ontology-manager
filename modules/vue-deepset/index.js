import path from 'path'

export default function nuxtDeepsetVue () {
  this.addPlugin(path.resolve(__dirname, 'plugin.js'))
}
