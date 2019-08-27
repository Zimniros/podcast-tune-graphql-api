import { GraphQLServer } from 'graphql-yoga';
import db from './db';

import { resolvers } from './resolvers';

const createServer = () =>
  new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
    context: req => ({ ...req, db }),
  });

export { createServer as default };
