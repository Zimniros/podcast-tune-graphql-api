/* eslint-disable import/no-cycle */
import getTopPodcast from '../../utils/fetching/getTopPodcasts';

import getCategories from '../../utils/fetching/getCategories';
import createPodcastWithFeed from '../../utils/createPodcastWithFeed';
import createPodcast from '../../utils/population/createPodcast';

export default {
  /*
      Data population methods
  */

  // // Initial Data Population for Categories
  async getCategories(parent, args, { db }, info) {
    const categoriesData = await getCategories();

    const promises = [];

    categoriesData.forEach(category => {
      const upsertPromise = db.mutation.createCategory({
        data: {
          ...category,
        },
      });
      promises.push(upsertPromise);
    }, info);

    const categories = await Promise.all(promises);

    return categories;
  },
  async getPodcasts(
    _,
    { limit = 200, country = 'US', first = 67, skip = 0, includeFeed = true },
    { db, request },
    info
  ) {
    request.setTimeout(0);

    const errors = [];

    const categories = await db.query.categories({
      first,
      skip,
    });

    console.log(`==============================`);
    console.log(`Getting podcast for categories`);
    console.log(`==============================`);
    console.time('All podcast for categories fetched in');

    for (const category of categories) {
      const { itunesId, name } = category;

      console.log(
        `Getting podcasts for category '${name}' (${itunesId}). Category ${categories.findIndex(
          el => el.itunesId === itunesId
        ) + 1} out of ${categories.length}`
      );
      console.time(`  Podcasts for category ${itunesId} fetched in`);
      const podcastsIds = await getTopPodcast({
        categoryId: itunesId,
        limit,
        country,
      });

      let index = 0;
      const range = includeFeed ? 10 : 20;
      const method = includeFeed ? createPodcastWithFeed : createPodcast;

      while (index <= podcastsIds.length) {
        const ids = podcastsIds.slice(index, index + range);

        await Promise.all(
          ids.map(id =>
            method(id).catch(error =>
              errors.push({
                id,
                error: error.message,
              })
            )
          )
        );

        index += range;
      }

      console.timeEnd(`  Podcasts for category ${itunesId} fetched in`);
    }

    console.log(`==============================`);
    console.timeEnd('All podcast for categories fetched in');
    console.log(`==============================`);

    console.log({ errors });
    return true;
  },
};
