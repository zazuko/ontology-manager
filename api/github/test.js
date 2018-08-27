module.exports = function tests (config) {
  const GitHubAPI = require('./api')
  const g = new GitHubAPI(config)

  g.createBranch()
    .then(async ({name} = {}) => {
      await g.updateFile({
        path: 'ontology.nt',
        message: `test ${Math.round(Math.random() * 100000)}`,
        content: Buffer.from(`test ${Math.round(Math.random() * 100000)}`).toString('base64'),
        branch: name,
        author: {
          name: 'API Attribution Test',
          email: 'victor.felder@zazuko.com',
          date: (new Date()).toISOString()
        }
      })
      await g.updateFile({
        path: 'ontology.nt',
        message: `test ${Math.round(Math.random() * 100000)}`,
        content: Buffer.from(`test ${Math.round(Math.random() * 100000)}`).toString('base64'),
        branch: name,
        author: {
          name: 'API Attribution Test',
          email: 'victor.felder@zazuko.com',
          date: (new Date()).toISOString()
        }
      })
      await g.updateFile({
        path: 'ontology.nt',
        message: `test ${Math.round(Math.random() * 100000)}`,
        content: Buffer.from(`test ${Math.round(Math.random() * 100000)}`).toString('base64'),
        branch: name,
        author: {
          name: 'API Attribution Test',
          email: 'victor.felder@zazuko.com',
          date: (new Date()).toISOString()
        }
      })
    })
    .then((x) => {
      // console.log(x, JSON.stringify(x, null, 2))
    })
}
