import populatePodcastFeed from '../utils/populatePodcastFeed';
import populatePodcastUrl from '../utils/populatePodcastUrl';

const Podcast = {
  async websiteUrl({ id }, args, { db }, info) {
    const podcast = await db.query.podcast({
      where: {
        id,
      },
    });

    const { websiteUrl } = podcast;

    if (!websiteUrl) {
      try {
        const link = await populatePodcastUrl(id);

        return link;
      } catch (error) {
        console.log(`Error in websiteUrl `, error.message);
        return websiteUrl;
      }
    }

    return websiteUrl;
  },
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
      populatePodcastFeed(id);
    }

    return episodes;
  },
};

export default Podcast;
