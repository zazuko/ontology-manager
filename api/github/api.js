const helpersFactory = require('./helpers')
const octokitFactory = require('@octokit/rest')
const debug = require('debug')('editor:api')

const __cache = new Map()

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
      debug: process.env.NODE_ENV !== 'production' || require('debug').enabled('editor:api'),
      auth: `token ${forge.committerPersonalAccessToken}`
    })
    debug('new GitHubAPIv3', {
      debug: process.env.NODE_ENV !== 'production' || require('debug').enabled('editor:api'),
      auth: `token ${forge.committerPersonalAccessToken}`
    })

    const { getRefSHA, getFileSHA } = helpersFactory(this.__octokit)
    this.__getRefSHA = getRefSHA
    this.__getFileSHA = getFileSHA
  }

  async createBranch () {
    const owner = this.owner
    const repo = this.repo
    const getRefSHAParams = {
      ref: `heads/${this.branch}`,
      owner,
      repo
    }
    debug('createBranch: getting SHA for ref', getRefSHAParams)
    const sha = await this.__getRefSHA(getRefSHAParams)

    const branchName = (new Date()).toISOString().replace(/:/g, '')

    const createRefParams = {
      ref: `refs/heads/${branchName}`,
      sha,
      owner,
      repo
    }
    debug('createBranch: creating ref', createRefParams)
    await this.__octokit.git.createRef(createRefParams)

    return {
      name: branchName
    }
  }

  async getFile ({ path = this.ontologyPath, branch = this.branch } = {}) {
    const owner = this.owner
    const repo = this.repo
    const ref = `heads/${branch}`
    const query = { owner, repo, path, ref }

    const cached = __cache.get(`${ref}/${path}`)
    const headers = cached ? { 'If-Modified-Since': cached.lastModified } : {}

    let content
    try {
      const response = await this.__octokit.repos.getContents({ ...query, headers })
      content = Buffer.from(response.data.content, 'base64').toString()
      const lastModified = response.headers['last-modified']
      __cache.set(`${ref}/${path}`, { lastModified, content })
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
    debug(`updateFile: for 'refs/heads/${branch}' SHA is '${sha}'`)

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
    debug(`updateFile: '${path}' committed`)

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
    debug(`createPR: ${branch} based on ${this.branch} created with number: ${response.data.number}`)

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
