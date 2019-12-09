import { postgraphile } from 'postgraphile'
import { PgMutationUpsertPlugin } from 'postgraphile-upsert-plugin'
const debug = require('debug')('editor:graphql')

// https://node-postgres.com/api/client
const pgConfig = {
  // number of milliseconds before a query will time out default is no timeout
  // bigger timeout for dev env to account for longer app startup time
  statement_timeout: process.env.NODE_ENV === 'production' ? 5000 : 15000
}
/*
For some reason, tests cannot run without this.
https://github.com/graphile/postgraphile/blob/04310e2b1766bd1705e39fef078738298a5444f4/src/postgraphile/postgraphile.ts#L19
This condition is always false, making graphile throw.
*/
Object.setPrototypeOf(pgConfig, Object.prototype)

const schemaName = 'editor_schema'

const debugErrors = [
  'severity',
  'code',
  'detail',
  'hint',
  'position',
  'internalPosition',
  'internalQuery',
  'where',
  'schema',
  'table',
  'column',
  'dataType',
  'constraint',
  'file',
  'line',
  'routine'
]

const options = {
  // anonymous user is set by migrations, do not change it
  pgDefaultRole: process.env.POSTGRESQL_ROLE_ANONYMOUS,
  graphqlRoute: '/graphql',
  graphiqlRoute: '/graphiql',
  enableCors: false,
  ignoreRBAC: false,
  jwtSecret: process.env.POSTGRAPHILE_TOKEN_SECRET,
  jwtPgTypeIdentifier: 'editor_schema.jwt_token',
  simpleSubscriptions: false,
  appendPlugins: [PgMutationUpsertPlugin],
  dynamicJson: true,
  disableQueryLog: !debug.enabled,
  // all the following options can be helpful in dev or debug mode
  graphiql: process.env.NODE_ENV !== 'production',
  enhanceGraphiql: process.env.NODE_ENV !== 'production',
  showErrorStack: true,
  extendedErrors: debugErrors
}

// https://www.graphile.org/postgraphile/usage-library/
const postgraphileMiddleware = process.env.BUILDING_WITHOUT_PG_ACCESS ? dummy : postgraphile(
  pgConfig,
  schemaName,
  options
)

export default postgraphileMiddleware

function dummy (req, res, next) {
  next()
}
