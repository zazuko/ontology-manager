const gql = require('graphql-tag')
const _get = require('lodash/get')

module.exports = factory

const actionTypes = [
  'PROPOSAL_SUBMIT',
  'PROPOSAL_ACCEPT',
  'PROPOSAL_REJECT',
  'CONVERSATION_CREATE',
  'CONVERSATION_COMMENT'
]

function factory (name) {
  return async function create (feed) {
    const anonApolloClient = await require('../api/getApolloClient')()

    let config = await anonApolloClient.query({
      query: gql`
        query CurrentPublicConfig {
          currentPublicConfig {
            version
            editor
            ontology
          }
        }`
    })
    config = _get(config, 'data.currentPublicConfig.editor')
    const editorUrl = `${config.protocol}://${config.host}`

    feed.options = {
      id: editorUrl,
      link: editorUrl,
      title: `${config.meta.title} - Activity List`,
      description: `Syndication feed - ${config.meta.description}`
    }

    const result = await anonApolloClient.query({
      query: gql`
        query ActivityLog {
          logs: allLogs (last: 15, orderBy: EVENT_DATE_DESC) {
            lines: nodes {
              id,
              author: personByAuthorId {
                id,
                name,
                avatar
              },
              thread: threadByThreadId {
                id,
                iri,
                headline
              }
              actionType,
              eventDate
            }
          }
        }`
    })

    _get(result, 'data.logs.lines', [])
      .filter(({ actionType } = {}) => actionTypes.includes(actionType))
      .forEach(item => {
        let title = ''
        let path = ''

        switch (item.actionType) {
          case 'PROPOSAL_SUBMIT':
            title = `New Proposal: ${item.thread.headline}`
            path = `/proposal/${item.thread.id}`
            break

          case 'PROPOSAL_ACCEPT':
            title = `Proposal Accepted: ${item.thread.headline}`
            path = `/proposal/${item.thread.id}`
            break

          case 'PROPOSAL_REJECT':
            title = `Proposal Rejected: ${item.thread.headline}`
            path = `/proposal/${item.thread.id}`
            break

          case 'CONVERSATION_CREATE':
            title = `Conversation Created: ${item.thread.headline}`
            path = `/discussion/${item.thread.id}`
            break

          case 'CONVERSATION_COMMENT':
            title = `New Comment on: ${item.thread.headline}`
            path = `/discussion/${item.thread.id}`
            break
        }

        feed.addItem({
          title,
          id: editorUrl + path,
          link: editorUrl + path,
          date: new Date(item.eventDate)
        })
      })
  }
}
