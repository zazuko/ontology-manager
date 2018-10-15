import { postgraphile } from 'postgraphile'

// https://node-postgres.com/api/client
const pgConfig = {
  host: process.env.POSTGRESQL_HOST || 'localhost',
  database: process.env.POSTGRESQL_DATABASE,
  // user is set by migrations, do not change it
  user: 'ontology_editor_postgraphile',
  password: process.env.POSTGRESQL_POSTGRAPHILE_PASSWORD,
  port: 5432,
  // number of milliseconds before a query will time out default is no timeout
  statement_timeout: 5000
}

const schemaName = 'ontology_editor'

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
  pgDefaultRole: 'ontology_editor_anonymous',
  graphqlRoute: '/graphql',
  graphiqlRoute: '/graphiql',
  enableCors: true,
  jwtSecret: process.env.POSTGRAPHILE_TOKEN_SECRET,
  jwtPgTypeIdentifier: 'ontology_editor.jwt_token',
  simpleSubscriptions: false,
  dynamicJson: true,
  // all the following options can be helpful in dev or debug mode
  graphiql: true,
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
