const helpersFactory = require('./helpers')
const octokitFactory = require('@octokit/rest')
const debug = require('debug')('editor:api')

module.exports = class GitHubAPIv3 {
  constructor ({ forge, editor, ontology }) {
    debug('new GitHubAPIv3')
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

    this.__cache = new Map()
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

  async getHeadSHA ({ branch = this.branch } = {}) {
    const owner = this.owner
    const repo = this.repo
    const ref = `heads/${branch}`
    const response = await this.__octokit.repos.getCommitRefSha({ owner, repo, ref })
    return response.data.sha
  }

  async getFile ({ path = this.ontologyPath, branch = this.branch } = {}) {
    const owner = this.owner
    const repo = this.repo
    const ref = `heads/${branch}`
    const query = { owner, repo, path, ref }

    const cached = this.__cache.get(`${ref}/${path}`)
    const headers = cached ? { 'If-Modified-Since': cached.lastModified } : {}

    let content
    try {
      const response = await this.__octokit.repos.getContents({ ...query, headers })
      content = Buffer.from(response.data.content, 'base64').toString()
      const lastModified = response.headers['last-modified']
      this.__cache.set(`${ref}/${path}`, { lastModified, content })
    }
    catch (error) {
      // '304 not modified', let's serve cached version
      if (error.status === 304) {
        debug(`github sent 304 for file ${ref}/${path}`)
        content = cached.content
      }
      else {
        debug(`rate limit: ${error.headers['x-ratelimit-remaining']}`)
        throw error
      }
    }

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

    const response = await this.__octokit.repos.updateFile({
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

    return response
  }

  async createPR ({ title, body, branch } = {}) {
    const owner = this.owner
    const repo = this.repo

    const response = await this.__octokit.pullRequests.create({
      head: branch,
      base: this.branch,
      maintainer_can_modify: true,
      owner,
      repo,
      title,
      body
    })

    return {
      number: response.data.number
    }
  }

  async mergePR ({ number, sha } = {}) {
    const owner = this.owner
    const repo = this.repo

    const response = await this.__octokit.pullRequests.merge({
      owner,
      repo,
      number,
      sha
    })

    return {
      success: !!response.data.merged, // true | undefined => bool
      message: response.data.message // shown to user if !success
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
