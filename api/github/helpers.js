module.exports = helpersFactory

function helpersFactory (octokit) {
  return {
    getRefSHA,
    getFileSHA
  }

  async function getRefSHA ({ owner, repo, ref } = {}) {
    const result = await octokit.repos.getShaOfCommitRef({ owner, repo, ref })

    return result.data.sha
  }

  async function getFileSHA ({ owner, repo, path, ref } = {}) {
    const result = await octokit.repos.getContents({ owner, repo, path, ref })

    return result.data.sha
  }
}
