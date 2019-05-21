import { GraphQLServer } from 'graphql-yoga';
import db from './db';
import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import Subscription from './resolvers/Subscription';

import Podcast from './resolvers/Podcast';

const createServer = () =>
  new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: {
      Subscription,
      Mutation,
      Query,
      Podcast,
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
    context: req => ({ ...req, db }),
  });

export { createServer as default };
