import { importSchema } from 'graphql-import';
import { resolve } from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import { graphql } from 'graphql';
import { resolvers } from '../../resolvers';
import db from '../../db';

const typeDefs = importSchema(resolve(__dirname, '../..', 'schema.graphql'));

const runQuery = (query, variables = {}, ctx = {}) => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  });

  return graphql(
    schema,
    query,
    null,
    req => ({ ...req, ...ctx, db }),
    variables
  );
};

export default runQuery;
