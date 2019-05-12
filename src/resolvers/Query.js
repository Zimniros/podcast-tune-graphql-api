import { forwardTo } from 'prisma-binding';

const Query = {
  categories: forwardTo('db'),
  podcasts: forwardTo('db'),
  podcastsConnection: forwardTo('db'),
};

export { Query as default };
