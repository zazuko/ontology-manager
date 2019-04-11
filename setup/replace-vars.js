// this script should be runnable as standalone because it is used in the entrypoint
// it should also be import-able from nuxt to replace vars when restarting the application
const fs = require('fs').promises
const path = require('path')
const shell = require('child_process').execSync
const dummyConfig = require('../fixtures/dummy-config')
const fetchConfig = require('./fetch-config')
const debug = require('debug')('editor:entrypoint')

module.exports = replace

if (require.main === module) {
  replace()
}

async function replace () {
  try {
    const { editor, forge } = await fetchConfig()
    const dummy = dummyConfig()

    let manifest = require(path.resolve(__dirname, '../nuxt_original/dist/server/client.manifest.json'))
    try {
      manifest = require(path.resolve(__dirname, '../.nuxt/dist/server/client.manifest.json'))
    }
    catch (err) {}

    const pathToOriginal = path.resolve(__dirname, '../nuxt_original')
    const pathToReplace = path.resolve(__dirname, '../.nuxt')

    const host = editor.host.replace(new RegExp('/$'), '')
    const editorUrl = `${editor.protocol}://${host}`
    shell(`rm -rf ${pathToReplace}`)
    shell(`cp -r ${pathToOriginal} ${pathToReplace}`)

    await setManifest(manifest)

    shell(`find ${pathToReplace}/ \\
      -type f \\
      -name '*.js' \\
      -exec sed -i "s+http://localhost:3000+${escape(editorUrl)}+g" '{}' \\; \\
      -exec sed -i "s+localhost:3000+${escape(host)}+g" '{}' \\; \\
      -exec sed -i "s+EDITOR_OAUTH_CLIENT_ID+${escape(editor.github.oauthClientId)}+g" '{}' \\; \\
      -exec sed -i "s+EDITOR_OAUTH_CLIENT_SECRET+${escape(forge.oauthClientSecret)}+g" '{}' \\; \\
      -exec sed -i "s+EDITOR_COMMITTER_PERSONAL_ACCESS_TOKEN+${escape(forge.committerPersonalAccessToken)}+g" '{}' \\; \\
      -exec sed -i "s+${escape(dummy.editor.meta.title)}+${escape(editor.meta.title)}+g" '{}' \\; \\
      -exec sed -i "s+${escape(dummy.editor.meta.customerName)}+${escape(editor.meta.customerName)}+g" '{}' \\; \\
      -exec sed -i "s+${escape(dummy.editor.meta.description)}+${escape(editor.meta.description)}+g" '{}' \\;
    `)
  }
  catch (err) {
    debug(err.message)
  }
}

function escape (str) {
  return str.replace(/([[\]+"]{1})/gi, '\\$&').replace(/\n/, '\\n')
}

async function setManifest (manifest) {
  manifest.initial = manifest.initial.map((_filename) => {
    let [filename, v] = _filename.split('=')
    if (v) {
      v = parseInt(v, 10)
      ;[filename] = filename.split('?')
    }
    else {
      v = 0
    }
    debug(`new version: ?v=${v + 1}`)
    return `${filename}?v=${v + 1}`
  })
  await fs.writeFile(
    path.resolve(__dirname, '../.nuxt/dist/server/client.manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  )
}
