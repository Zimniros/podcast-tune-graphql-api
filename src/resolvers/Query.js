import { forwardTo } from 'prisma-binding';
import fetchSearchResults from '../utils/fetchSearchResults';

const Query = {
  me(parent, args, { db, session }, info) {
    if (!session.userId) {
      return null;
    }
    return db.query.user(
      {
        where: { id: session.userId },
      },
      info
    );
  },
  queue(parent, args, { request, db }, info) {
    const { userId } = request;

    if (!request.userId) {
      throw new Error(`You aren't logged in!`);
    }

    return db.query.queueEpisodes(
      {
        where: { user: { id: userId }, position_not: 1 },
        orderBy: 'position_ASC',
      },
      info
    );
  },
  async playingEpisode(parent, args, { request, db }, info) {
    const { userId } = request;

    if (!request.userId) {
      throw new Error(`You aren't logged in!`);
    }

    const episodes = await db.query.queueEpisodes(
      {
        where: { user: { id: userId }, position: 1 },
      },
      info
    );

    return episodes[0];
  },
  favorites(parent, args, { request, db }, info) {
    const { userId } = request;

    if (!request.userId) {
      throw new Error(`You aren't logged in!`);
    }

    return db.query.favoriteEpisodes(
      {
        where: { user: { id: userId } },
        orderBy: 'addedAt_DESC',
      },
      info
    );
  },
  subscribedPodcasts(parent, args, { request, db }, info) {
    const { userId } = request;

    if (!request.userId) {
      throw new Error(`You aren't logged in!`);
    }

    return db.query.subscribedPodcasts(
      {
        where: { user: { id: userId } },
        orderBy: 'subscribedAt_DESC',
      },
      info
    );
  },
  inProgress(parent, args, { request, db }, info) {
    const { userId } = request;

    if (!request.userId) {
      throw new Error(`You aren't logged in!`);
    }

    return db.query.inProgressEpisodes(
      {
        where: { user: { id: userId } },
        orderBy: 'updatedAt_DESC',
      },
      info
    );
  },

  podcasts: forwardTo('db'),
  episodes: forwardTo('db'),
  categories: forwardTo('db'),

  podcast: forwardTo('db'),
  episode: forwardTo('db'),
  category: forwardTo('db'),

  podcastsConnection: forwardTo('db'),
  episodesConnection: forwardTo('db'),
  categoriesConnection: forwardTo('db'),

  async itunesResults(parent, { searchTerm, limit }, { db }, info) {
    const results = [];
    try {
      console.log(`======================================================`);
      console.log(`Getting results for term '${searchTerm}'.`);
      console.time(`Search for term ${searchTerm} done in: `);

      const searchResults = await fetchSearchResults(searchTerm, limit);

      if (!searchResults.length) return results;

      await Promise.all(
        searchResults.map(async previewData => {
          const { itunesId, categoryIds } = previewData;

          console.log({ previewData });

          const preview = await db.query.podcast(
            {
              where: {
                itunesId,
              },
            },
            info
          );

          if (!preview) {
            delete previewData.categoryIds;

            const data = {
              ...previewData,
              categories: {
                connect: categoryIds,
              },
            };

            const podcast = await db.mutation.createPodcast(
              {
                data,
              },
              info
            );

            return results.push(podcast);
          }

          return results.push(preview);
        })
      );

      return results;
    } catch (error) {
      console.log({ error: error.message });
      return results;
      // console.log({ error });
    } finally {
      console.timeEnd(`Search for term ${searchTerm} done in: `);
      console.log(`======================================================`);
    }
  },
};

export { Query as default };
