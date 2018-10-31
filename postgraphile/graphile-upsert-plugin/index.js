// https://github.com/einarjegorov/graphile-upsert-plugin/tree/94ea92e71e25a3c981feaa40cebcd0aad781f1af

const path = require('path')
const dir = path.dirname(require.resolve('graphile-build-pg'))

function PgMutationUpsertPlugin(builder, { pgExtendedTypes, pgInflection: inflection }) {

  // In order to build this mutation, we need some stuff from graphile-build-pg
  // Since these functions are not exported, we need to include the files.

  // NOTE: Currently this plugin requires Node version 8 or newer to work!
  // TODO: Detect node version and fetch appropriate files!

  const queryFromResolveData = require(path.join(dir, 'queryFromResolveData.js')).default;
  const viaTemporaryTable = require(path.join(dir, 'plugins', 'viaTemporaryTable.js')).default;

  builder.hook(
    "GraphQLObjectType:fields",
    (
      fields,
      {
        extend,
        getTypeByName,
        newWithHooks,
        parseResolveInfo,
        pgIntrospectionResultsByKind,
        pgSql: sql,
        gql2pg,
        graphql: {
          GraphQLObjectType,
          GraphQLInputObjectType,
          GraphQLNonNull,
          GraphQLString,
        },
      },
      { scope: { isRootMutation }, fieldWithHooks }
    ) => {
      if (!isRootMutation) {
        return fields;
      }

      return extend(
        fields,
        pgIntrospectionResultsByKind.class
          .filter(table => !!table.namespace)
          .filter(table => table.isSelectable)
          .filter(table => table.isInsertable)
          .filter(table => table.isUpdatable)
          .reduce((memo, table) => {
            const Table = getTypeByName(
              inflection.tableType(table.name, table.namespace.name)
            );

            if (!Table) {
              return memo;
            }

            const TableInput = getTypeByName(inflection.inputType(Table.name));
            if (!TableInput) {
              return memo;
            }

            const tableTypeName = inflection.tableType(
              table.name,
              table.namespace.name
            );

            // Standard input type that 'create' uses
            const InputType = newWithHooks(
              GraphQLInputObjectType,
              {
                name: `Upsert${tableTypeName}Input`,
                description: `All input for the upsert \`${tableTypeName}\` mutation.`,
                fields: {
                  clientMutationId: {
                    description:
                      "An arbitrary string value with no semantic meaning. Will be included in the payload verbatim. May be used to track mutations by the client.",
                    type: GraphQLString,
                  },
                  [inflection.tableName(table.name, table.namespace.name)]: {
                    description: `The \`${tableTypeName}\` to be upserted by this mutation.`,
                    type: new GraphQLNonNull(TableInput),
                  },
                },
              },
              {
                isPgCreateInputType: false,
                pgInflection: table,
              }
            );

            // Standard payload type that 'create' uses
            const PayloadType = newWithHooks(
              GraphQLObjectType,
              {
                name: `Upsert${tableTypeName}Payload`,
                description: `The output of our upsert \`${tableTypeName}\` mutation.`,
                fields: ({ recurseDataGeneratorsForField }) => {
                  const tableName = inflection.tableName(
                    table.name,
                    table.namespace.name
                  );
                  recurseDataGeneratorsForField(tableName);
                  return {
                    clientMutationId: {
                      description:
                        "The exact same `clientMutationId` that was provided in the mutation input, unchanged and unused. May be used by a client to track mutations.",
                      type: GraphQLString,
                    },
                    [tableName]: {
                      description: `The \`${tableTypeName}\` that was upserted by this mutation.`,
                      type: Table,
                      resolve(data) {
                        return data.data;
                      },
                    },
                  };
                },
              },
              {
                isMutationPayload: true,
                isPgCreatePayloadType: false,
                pgIntrospection: table,
              }
            );

            // Create upsert fields from each introspected table
            const fieldName = `upsert${tableTypeName}`;

            memo[fieldName] = fieldWithHooks(fieldName, ({ getDataFromParsedResolveInfoFragment }) => ({
              description: `Upserts a single \`${tableTypeName}\`.`,
              type: PayloadType,
              args: {
                input: {
                  type: new GraphQLNonNull(InputType),
                },
              },
              async resolve(data, { input }, { pgClient }, resolveInfo) {
                const parsedResolveInfoFragment = parseResolveInfo(
                  resolveInfo
                );
                const resolveData = getDataFromParsedResolveInfoFragment(
                  parsedResolveInfoFragment,
                  PayloadType
                );
                const insertedRowAlias = sql.identifier(Symbol());
                const query = queryFromResolveData(
                  insertedRowAlias,
                  insertedRowAlias,
                  resolveData,
                  {}
                );

                const sqlColumns = [];
                const sqlValues = [];
                const inputData = input[inflection.tableName(table.name, table.namespace.name)];

                // Store attributes (columns) for easy access
                const attributes = pgIntrospectionResultsByKind.attribute
                  .filter(attr => attr.classId === table.id);

                // Figure out the pkey constraint
                const primaryKeyConstraint = pgIntrospectionResultsByKind.constraint
                  .filter(con => con.classId === table.id)
                  .filter(con => con.type === "p")[0];

                // Figure out to which column that pkey constraint belongs to
                const primaryKeys =
                  primaryKeyConstraint &&
                  primaryKeyConstraint.keyAttributeNums.map(
                    num => attributes.filter(attr => attr.num === num)[0]
                  );

                // Loop thru columns and "SQLify" them
                attributes.forEach(attr => {
                    const fieldName = inflection.column(
                      attr.name,
                      table.name,
                      table.namespace.name
                    );
                    const val = inputData[fieldName];
                    if (val != null) {
                      sqlColumns.push(sql.identifier(attr.name));
                      sqlValues.push(gql2pg(val, attr.type, null));
                    }
                  });

                // Construct a array in case we need to do an update on conflict
                const conflictUpdateArray = sqlColumns.map(col =>
                  sql.query`${sql.identifier(col.names[0])} = excluded.${sql.identifier(col.names[0])}`
                );

                // SQL query for upsert mutations
                const mutationQuery = sql.query`
                  insert into ${sql.identifier(
                    table.namespace.name,
                    table.name
                  )} ${sqlColumns.length
                  ? sql.fragment`(
                      ${sql.join(sqlColumns, ", ")}
                    ) values(${sql.join(sqlValues, ", ")})
                    ON CONFLICT (${sql.identifier(primaryKeys[0].name)}) DO UPDATE
                    SET ${sql.join(conflictUpdateArray, ", ")}`
                  : sql.fragment`default values`} returning *`;

                // const { rows: [row] } = await viaTemporaryTable(
                const result = await viaTemporaryTable(
                  pgClient,
                  sql.identifier(table.namespace.name, table.name),
                  mutationQuery,
                  insertedRowAlias,
                  query
                );

                return {
                  clientMutationId: input.clientMutationId,
                  // data: row,
                  data: result[0],
                };

              },
            }), {});

            return memo;
          }, {})
      );
    }
  );
}

module.exports = PgMutationUpsertPlugin;
