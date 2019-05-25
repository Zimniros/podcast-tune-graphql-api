import { forwardTo } from 'prisma-binding';

const Query = {
  podcasts: forwardTo('db'),
  episodes: forwardTo('db'),
  categories: forwardTo('db'),

  podcast: forwardTo('db'),
  episode: forwardTo('db'),
  category: forwardTo('db'),

  podcastsConnection: forwardTo('db'),
  episodesConnection: forwardTo('db'),
  categoriesConnection: forwardTo('db'),
};

export { Query as default };
