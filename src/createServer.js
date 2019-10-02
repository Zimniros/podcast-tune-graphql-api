import { GraphQLServer } from 'graphql-yoga';
import db from './db';
import redis from './redis';

import { resolvers } from './resolvers';

const createServer = () =>
  new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
    context: ({ request, response }) => ({
      request,
      response,
      db,
      redis,
      url: request ? `${request.protocol}://${request.get('host')}` : '',
      session: request ? request.session : undefined,
    }),
  });

export { createServer as default };
