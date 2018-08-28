const helpersFactory = require('./helpers')
const octokitFactory = require('@octokit/rest')

const octokit = octokitFactory({debug: process.env.NODE_ENV !== 'production'})

octokit.authenticate({
  type: 'oauth',
  token: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
})

const { getRefSHA, getFileSHA } = helpersFactory(octokit)

module.exports = class GitHubAPIv3 {
  constructor ({branch, committer, owner, repo} = {}) {
    if (!branch || !committer || !owner || !repo) {
      throw new Error('GitHubAPIv3 should be instantiated with a config object')
    }

    this.branch = branch
    this.owner = owner
    this.repo = repo
    this.committer = committer
    this.path = 'ontology.nt'
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
    await octokit.gitdata.createReference({
      ref: `refs/heads/${branchName}`,
      sha,
      owner,
      repo
    })

    return {
      name: branchName
    }
  }

  async updateFile ({message, content, branch, author} = {}) {
    const owner = this.owner
    const repo = this.repo
    const committer = this.committer

    const sha = await getFileSHA({
      path: this.path,
      ref: `refs/heads/${branch}`,
      owner,
      repo
    })

    const result = await octokit.repos.updateFile({
      path: this.path,
      content: Buffer.from(content).toString('base64'),
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

  async createPR ({title, body, branch} = {}) {
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
}
