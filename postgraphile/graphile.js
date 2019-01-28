import { postgraphile } from 'postgraphile'
import PgMutationUpsertPlugin from 'graphile-upsert-plugin'

// https://node-postgres.com/api/client
const pgConfig = {
  host: process.env.POSTGRESQL_HOST || 'localhost',
  database: process.env.POSTGRESQL_DATABASE,
  user: process.env.POSTGRESQL_ROLE_POSTGRAPHILE,
  password: process.env.POSTGRESQL_ROLE_POSTGRAPHILE_PASSWORD,
  port: 5432,
  // number of milliseconds before a query will time out default is no timeout
  statement_timeout: 5000
}

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
  // all the following options can be helpful in dev or debug mode
  graphiql: pgConfig.host === 'localhost',
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
