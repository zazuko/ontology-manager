const fs = require('fs')
const util = require('util')
const helpersFactory = require('./helpers')
const octokitFactory = require('@octokit/rest')
const octokit = octokitFactory({ debug: process.env.NODE_ENV !== 'production' })

const readFile = util.promisify(fs.readFile)

octokit.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
})

const { getRefSHA, getFileSHA } = helpersFactory(octokit)

module.exports = class GitHubAPIv3 {
  constructor () {
    this.branch = process.env.EDITOR_GITHUB_BRANCH
    this.owner = process.env.EDITOR_GITHUB_OWNER
    this.repo = process.env.EDITOR_GITHUB_REPO
    this.committer = {
      name: process.env.EDITOR_COMMITTER_NAME,
      email: process.env.EDITOR_COMMITTER_EMAIL,
      get date () {
        return (new Date()).toISOString()
      }
    }
    this.ontologyPath = process.env.ONTOLOGY_FILENAME
    this.structurePath = process.env.STRUCTURE_FILENAME
  }

  async createBranch () {
    const owner = this.owner
    const repo = this.repo
    const sha = await getRefSHA({
      ref: `heads/${this.branch}`,
      owner,
      repo
    })

    const branchName = (new Date()).toISOString().replace(/:/g, '')
    await octokit.gitdata.createRef({
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
    return readFile(require.resolve(`../../test/repo/${path}`))
  }

  async updateFile ({ message, content, branch, author, structure = false }) {
    const owner = this.owner
    const repo = this.repo
    const committer = this.committer
    const path = structure ? this.structurePath : this.ontologyPath

    const sha = await getFileSHA({
      ref: `refs/heads/${branch}`,
      path,
      owner,
      repo
    })

    const result = await octokit.repos.updateFile({
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

    const result = await octokit.pullRequests.create({
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

    const result = await octokit.pullRequests.merge({
      owner,
      repo,
      number,
      sha
    })

    return {
      success: !!result.data.merged, // true | undefined => bool
      message: result.data.message
    }
  }

  async closePR ({ number } = {}) {
    const owner = this.owner
    const repo = this.repo

    await octokit.pullRequests.update({
      owner,
      repo,
      number,
      state: 'closed'
    })

    return {}
  }
}
