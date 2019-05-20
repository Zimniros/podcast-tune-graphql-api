import getPodcastFeed from '../utils/getPodcastFeed';

const Podcast = {
  async episodes({ id }, args, { db }, info) {
    const episodes = await db.query.episodes(
      {
        where: {
          podcast: {
            id,
          },
        },
      },
      info
    );

    if (Array.isArray(episodes) && episodes.length === 0) {
      console.time(`Episodes for podcast '${id}' populated in `);
      const podcast = await db.query.podcast({
        where: {
          id,
        },
      });

      const { feedUrl, title } = podcast;
      const feedData = await getPodcastFeed(feedUrl);

      const feed = [];

      for (const rawEpisode of feedData.episodes) {
        try {
          const ep = await db.mutation.createEpisode({
            data: {
              ...rawEpisode,
              podcast: {
                connect: {
                  id,
                },
              },
            },
          });

          feed.push(ep);
        } catch (error) {
          console.log(`Error during creating episode for podcast '${title}'`, {
            rawEpisode,
          });
        }
      }

      console.timeEnd(`Episodes for podcast '${id}' populated in `);
      return feed;
    }

    return episodes;
  },
};

export default Podcast;
