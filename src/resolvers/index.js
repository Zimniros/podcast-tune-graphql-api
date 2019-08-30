/* eslint-disable import/no-cycle */
import { extractFragmentReplacements } from 'prisma-binding';
import Query from './Query';
import Mutation from './Mutation';
import Episode from './Episode';
import Podcast from './Podcast';

const resolvers = {
  Query,
  Mutation,
  Episode,
  Podcast,
};

const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
