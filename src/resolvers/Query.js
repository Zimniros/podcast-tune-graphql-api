import { forwardTo } from 'prisma-binding';
import populatePodcastFeed from '../utils/populatePodcastFeed';

const Query = {
  podcasts: forwardTo('db'),
  episodes: forwardTo('db'),
  categories: forwardTo('db'),

  podcast: forwardTo('db'),
  episode: forwardTo('db'),
  category: forwardTo('db'),

  podcastsConnection: forwardTo('db'),
  async episodesConnection(parent, args, ctx, info) {
    const { podcastId } = info.variableValues;
    if (!podcastId) return forwardTo('db')(parent, args, ctx, info);

    const episodes = await ctx.db.query.episodes({
      where: {
        podcast: {
          id: podcastId,
        },
      },
    });

    if (episodes.length === 0) {
      await populatePodcastFeed(podcastId);
    }

    return forwardTo('db')(parent, args, ctx, info);
  },
  categoriesConnection: forwardTo('db'),
};

export { Query as default };
