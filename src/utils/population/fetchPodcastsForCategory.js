import getTopPodcasts from '../fetching/getTopPodcasts';
import createPodcast from './createPodcast';
import createPodcastWithFeed from '../createPodcastWithFeed';

const fetchPodcastsForCategory = async ({ categoryId, limit, country }) =>
  new Promise(async (resolve, reject) => {
    let podcastsIds;

    try {
      podcastsIds = await getTopPodcasts({ categoryId, limit, country });
    } catch (error) {
      return reject(error);
    }

    let index = 0;

    // Prevents from hitting request rate to apples servers
    const range = 20;

    // Prevents 'createPodcastWithFeed' from crushing server due to too many request
    // const range = 10;

    while (index <= podcastsIds.length) {
      const ids = podcastsIds.slice(index, index + range);

      // await Promise.all(
      //   ids.map(id =>
      //     createPodcast(id).catch(error =>
      //       console.log(`Error in creating podcast method ${id}`, {
      //         error: error.message,
      //       })
      //     )
      //   )
      // );

      await Promise.all(
        ids.map(id =>
          createPodcastWithFeed(id).catch(error =>
            console.log(`Error in creating podcast method with id ${id}`, {
              error: error.message,
            })
          )
        )
      );

      index += range;
    }

    resolve();
  });

export default fetchPodcastsForCategory;
