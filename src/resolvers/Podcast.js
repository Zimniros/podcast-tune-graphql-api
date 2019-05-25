import dayjs from 'dayjs';
import populatePodcastFeed from '../utils/population/populatePodcastFeed';
import updatePodcastFeed from '../utils/population/updatePodcastFeed';

const Podcast = {
  async episodes(parent, args, { db }, info) {
    const { variableValues } = info;
    const { id } = variableValues;

    const podcast = await db.query.podcast({
      where: {
        id,
      },
    });

    const { feedCheckedAt } = podcast;

    if (!feedCheckedAt) {
      await populatePodcastFeed(id);
    } else if (dayjs(new Date()).diff(dayjs(feedCheckedAt), 'hour') > 2) {
      await updatePodcastFeed(id);
    }

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

    return episodes;
  },
};

export default Podcast;
