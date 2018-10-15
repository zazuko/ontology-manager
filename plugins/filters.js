import Vue from 'vue'
import ontologyConfig from '@/ontology.config'

const { owner, repo } = ontologyConfig.github

Vue.filter('formatDate', (date) => {
  const d = new Date(date).toISOString()
  return d.substring(0, d.indexOf('T'))
})

Vue.filter('forgeLink', (id) => {
  return `https://github.com/${owner}/${repo}/pull/${id}`
})
