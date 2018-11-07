import Vue from 'vue'
import ontologyConfig from '@/ontology.config'

const { owner, repo } = ontologyConfig.github

Vue.filter('formatDate', (date) => {
  const d = new Date(date).toISOString()
  return d.substring(0, d.indexOf('T'))
})

Vue.filter('formatTime', (date) => {
  const d = new Date(date).toISOString()
  const dateTimeSeparator = d.indexOf('T')
  const datePart = d.substring(0, dateTimeSeparator)
  const timePart = d.substring(dateTimeSeparator + 1, d.indexOf('.'))
  return `${datePart} ${timePart}`
})

Vue.filter('forgeLink', (id) => {
  return `https://github.com/${owner}/${repo}/pull/${id}`
})
