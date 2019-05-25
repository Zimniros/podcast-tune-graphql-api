import createPodcast from './createPodcast';
import populatePodcastFeed from './population/populatePodcastFeed';

const createPodcastWithFeed = itunesId =>
  new Promise(async (resolve, reject) => {
    if (!itunesId)
      return reject(new Error('A podcast itunesId was not provided.'));
    if (Number.isNaN(itunesId))
      return reject(new Error('A itunesId must be a number.'));

    try {
      const podcastData = await createPodcast(itunesId);
      const { id } = podcastData;

      const feed = await populatePodcastFeed(id);
      return resolve(feed);
    } catch (error) {
      return reject(error);
    }
  });

export default createPodcastWithFeed;
