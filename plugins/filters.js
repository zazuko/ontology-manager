import Vue from 'vue'

Vue.filter('formatDate', (date) => {
  const dateObj = new Date(date)
  // Turns out `new Date(date).toISOString()` is unsafe…
  if (isNaN(dateObj.getTime())) {
    return ''
  }
  const dateString = dateObj.toISOString()
  return dateString.substring(0, dateString.indexOf('T'))
})

Vue.filter('formatTime', (date) => {
  const d = new Date(date).toISOString()
  const dateTimeSeparator = d.indexOf('T')
  const datePart = d.substring(0, dateTimeSeparator)
  const timePart = d.substring(dateTimeSeparator + 1, d.indexOf('.'))
  return `${datePart} ${timePart}`
})
