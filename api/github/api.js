const debug = require('debug')('editor:backend')
const octokitDebug = require('debug')('editor:octokit')
const { Octokit } = require('@octokit/rest')
const helpersFactory = require('./helpers')

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
    this.__octokit = new Octokit({
      debug: process.env.NODE_ENV !== 'production' || require('debug').enabled('editor:backend'),
      auth: `token ${forge.committerPersonalAccessToken}`,
      log: {
        debug: octokitDebug,
        info: octokitDebug,
        log: octokitDebug,
        warn: octokitDebug,
        error: octokitDebug
      }
    })
    debug('new GitHubAPIv3', {
      debug: process.env.NODE_ENV !== 'production' || require('debug').enabled('editor:backend'),
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
    const ref = branch
    const query = { owner, repo, path, ref }

    const cached = __cache.get(`${ref}/${path}`)
    const headers = cached ? { 'If-None-Match': cached.etag } : {}

    let content
    let etag
    try {
      const response = await this.__octokit.repos.getContent({ ...query, headers })
      content = Buffer.from(response.data.content, 'base64').toString()
      etag = response.headers.etag
      debug(`github sent 200 for file ${ref}/${path}`)
    }
    catch (error) {
      // '304 not modified', let's serve cached version
      if (error.status === 304) {
        debug(`github sent 304 for file ${ref}/${path}`)
        return cached.content
      }
      else {
        debug(`rate limit: ${error.headers['x-ratelimit-remaining']}, ${ref}/${path}`)
        throw new Error('rate limited')
      }
    }

    __cache.set(`${ref}/${path}`, { etag, content })
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

    const response = await this.__octokit.repos.createOrUpdateFileContents({
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
}
