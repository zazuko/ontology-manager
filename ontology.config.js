module.exports = {
  github: {
    repo: 'o',
    owner: 'vhf',
    branch: 'example-com',
    files: {
      structure: 'structure.nt',
      ontology: 'ontology.nt'
    },
    committer: {
      // system user, the git identity of the committer who attributes commits
      // to the ontology editor user
      name: 'Ontology Editor',
      email: 'victor.felder@zazuko.com',
      get date () {
        return (new Date()).toISOString()
      }
    }
  }
}
