const fs = require('fs').promises
const path = require('path')

const tmpTestFolder = path.resolve('./test/repo/tmp')
fs.mkdir(tmpTestFolder).catch(() => {})
const log = path.resolve('./test/repo/tmp/log.txt')

async function append (str, obj) {
  await fs.appendFile(log, `${str}\n`)
  if (obj) {
    await fs.appendFile(log, `${JSON.stringify(obj, null, 2)}\n`)
  }
  await fs.appendFile(log, '---\n')
}

module.exports = class FSAPI {
  constructor ({ forge, editor, ontology }) {
    this.branch = editor.github.branch
    this.owner = editor.github.owner
    this.repo = editor.github.repo
    this.committer = {
      name: editor.committer.name,
      email: editor.committer.email,
      get date () {
        return (new Date()).toISOString()
      }
    }
    this.ontologyPath = ontology.ontologyRawUrl.substr(ontology.ontologyRawUrl.lastIndexOf('/') + 1)
    this.structurePath = ontology.structureRawUrl.substr(ontology.structureRawUrl.lastIndexOf('/') + 1)
  }

  async createBranch () {
    const owner = this.owner
    const repo = this.repo

    const branchName = (new Date()).toISOString().replace(/:/g, '')
    await append('createBranch', {
      ref: `refs/heads/${branchName}`,
      owner,
      repo
    })

    return {
      name: branchName
    }
  }

  async getFile ({ path = this.ontologyPath, branch = this.branch } = {}) {
    return fs.readFile(require.resolve(`../../test/repo/${path}`))
  }

  async updateFile ({ message, content, branch, author, structure = false }) {
    const owner = this.owner
    const repo = this.repo
    const committer = this.committer
    const path = structure ? this.structurePath : this.ontologyPath

    await append('updateFile', {
      content,
      path,
      owner,
      repo,
      message,
      branch,
      committer,
      author
    })
  }

  async createPR ({ title, body, branch } = {}) {
    const owner = this.owner
    const repo = this.repo

    await append('createPR', {
      head: branch,
      base: this.branch,
      maintainer_can_modify: true,
      owner,
      repo,
      title,
      body
    })

    return {
      number: Math.floor(Math.random() * 1000000)
    }
  }

  async mergePR ({ number, sha } = {}) {
    const owner = this.owner
    const repo = this.repo

    await append('mergePR', {
      owner,
      repo,
      number,
      sha
    })

    return {
      success: true, // true | undefined => bool
      message: ''
    }
  }

  async closePR ({ number } = {}) {
    const owner = this.owner
    const repo = this.repo

    await append('closePR', {
      owner,
      repo,
      number,
      state: 'closed'
    })
  }
}
