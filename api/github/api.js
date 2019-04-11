const helpersFactory = require('./helpers')
const octokitFactory = require('@octokit/rest')

module.exports = class GitHubAPIv3 {
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

    // private helpers
    this.__octokit = octokitFactory({
      debug: process.env.NODE_ENV !== 'production',
      auth: forge.committerPersonalAccessToken
    })

    const { getRefSHA, getFileSHA } = helpersFactory(this.__octokit)
    this.__getRefSHA = getRefSHA
    this.__getFileSHA = getFileSHA
  }

  async createBranch () {
    const owner = this.owner
    const repo = this.repo
    const sha = await this.__getRefSHA({
      ref: `heads/${this.branch}`,
      owner,
      repo
    })

    const branchName = (new Date()).toISOString().replace(/:/g, '')
    await this.__octokit.git.createRef({
      ref: `refs/heads/${branchName}`,
      sha,
      owner,
      repo
    })

    return {
      name: branchName
    }
  }

  async getFile ({ path = this.ontologyPath, branch = this.branch } = {}) {
    const owner = this.owner
    const repo = this.repo
    const ref = `heads/${this.branch}`
    const result = await this.__octokit.repos.getContents({ owner, repo, path, ref })
    const content = Buffer.from(result.data.content, 'base64').toString()
    return content
  }

  async updateFile ({ message, content, branch, author, structure = false }) {
    const owner = this.owner
    const repo = this.repo
    const committer = this.committer
    const path = structure ? this.structurePath : this.ontologyPath

    const sha = await this.__getFileSHA({
      ref: `refs/heads/${branch}`,
      path,
      owner,
      repo
    })

    const result = await this.__octokit.repos.updateFile({
      content: Buffer.from(content).toString('base64'),
      path,
      owner,
      repo,
      message,
      sha,
      branch,
      committer,
      author
    })

    return result
  }

  async createPR ({ title, body, branch } = {}) {
    const owner = this.owner
    const repo = this.repo

    const result = await this.__octokit.pullRequests.create({
      head: branch,
      base: this.branch,
      maintainer_can_modify: true,
      owner,
      repo,
      title,
      body
    })

    return {
      number: result.data.number
    }
  }

  async mergePR ({ number, sha } = {}) {
    const owner = this.owner
    const repo = this.repo

    const result = await this.__octokit.pullRequests.merge({
      owner,
      repo,
      number,
      sha
    })

    return {
      success: !!result.data.merged, // true | undefined => bool
      message: result.data.message // shown to user if !success
    }
  }

  async closePR ({ number } = {}) {
    const owner = this.owner
    const repo = this.repo

    await this.__octokit.pullRequests.update({
      owner,
      repo,
      number,
      state: 'closed'
    })
  }
}
