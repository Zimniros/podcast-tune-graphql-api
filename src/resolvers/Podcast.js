import populatePodcastFeed from '../utils/populatePodcastFeed';

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

      const feed = await populatePodcastFeed(id);

      console.timeEnd(`Episodes for podcast '${id}' populated in `);
      return feed;
    }

    return episodes;
  },
};

export default Podcast;
