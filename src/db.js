/* eslint-disable import/no-cycle */
import { Prisma } from 'prisma-binding';
import { fragmentReplacements } from './resolvers';

const db = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  debug: false,
  fragmentReplacements,
});

export { db as default };
