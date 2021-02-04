module.exports = helpersFactory

function helpersFactory (octokit) {
  return {
    getRefSHA,
    getFileSHA
  }

  async function getRefSHA ({ owner, repo, ref } = {}) {
    const result = await octokit.repos.getCommit({
      owner,
      repo,
      // See: https://github.com/stackriot-labs/rest.js/pull/123#discussion_r288586471
      commit_sha: ref,
      mediaType: {
        format: 'sha'
      }
    })

    return result.data.sha
  }

  async function getFileSHA ({ owner, repo, path, ref } = {}) {
    const result = await octokit.repos.getContent({ owner, repo, path, ref })

    return result.data.sha
  }
}
