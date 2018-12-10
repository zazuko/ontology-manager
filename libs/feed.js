const gql = require('graphql-tag')
const _get = require('lodash/get')
const editorConfig = require('../editor.config')

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
    const apolloClientFactory = require('../api/getApolloClient')
    const anonApolloClient = apolloClientFactory()

    feed.options = {
      title: `${editorConfig.website.head.title} - Activity List`,
      link: `${editorConfig.website.head.title}/${name}.xml`,
      description: editorConfig.website.head.description
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
        }
      `,
      variables: {}
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
          id: editorConfig.website.url + path,
          link: editorConfig.website.url + path,
          date: new Date(item.eventDate)
        })
      })
  }
}
