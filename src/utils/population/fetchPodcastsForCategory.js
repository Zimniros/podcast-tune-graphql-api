import fetchTopPodcasts from './fetchTopPodcasts';
import createPodcast from '../createPodcast';

const fetchPodcastsForCategory = async ({ categoryId, limit, country }) =>
  new Promise(async (resolve, reject) => {
    let podcastsIds;

    try {
      podcastsIds = await fetchTopPodcasts({ categoryId, limit, country });
    } catch (error) {
      return reject(error);
    }

    let index = 0;
    const range = 20;

    while (index <= podcastsIds.length) {
      const ids = podcastsIds.slice(index, index + range);

      await Promise.all(
        ids.map(id =>
          createPodcast(id).catch(e =>
            console.log('Error in creating podcast method', { e })
          )
        )
      );

      index += range;
    }

    resolve();
  });

export default fetchPodcastsForCategory;
