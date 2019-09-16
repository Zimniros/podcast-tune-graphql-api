import fetchPodcastsForCategory from '../../utils/population/fetchPodcastsForCategory';
import getCategories from '../../utils/fetching/getCategories';

export default {
  /*
      Data population methods
  */

  // // Initial Data Population for Categories
  async getCategories(parent, args, { db }, info) {
    const categoriesData = await getCategories();
    await db.mutation.deleteManyCategories();

    const promises = [];

    categoriesData.forEach(category => {
      const upsertPromise = db.mutation.createCategory({
        data: {
          ...category,
        },
      });
      promises.push(upsertPromise);
    });

    const categories = await Promise.all(promises);

    return categories;
  },
  // Initial Data Population for Podcast preview for each category
  async getPodcastsForAllCategories(
    parent,
    { limit = 200, country = 'US', first = 67, skip = 0 },
    { db, request },
    info
  ) {
    request.setTimeout(0);
    const categories = await db.query.categories({
      first,
      skip,
    });

    // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop/37576787#37576787

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
      await fetchPodcastsForCategory({ categoryId: itunesId, limit, country });

      console.timeEnd(`  Podcasts for category ${itunesId} fetched in`);
    }

    console.log(`==============================`);
    console.timeEnd('All podcast for categories fetched in');
    console.log(`==============================`);

    return true;
  },
  async getPodcastsForCategory(
    parent,
    { categoryId, limit = 200, country = 'US' },
    { db, request },
    info
  ) {
    request.setTimeout(0);

    const exists = await db.query.category({
      where: {
        itunesId: categoryId,
      },
    });

    if (!exists)
      throw new Error(`Category with id '${categoryId}' doesn't exist.`);

    console.log(`==============================`);
    console.log(`Getting podcasts for category`);
    console.log(`==============================`);
    console.time(`All podcasts for category '${categoryId}' fetched in`);

    await fetchPodcastsForCategory({ categoryId, limit, country });

    console.log(`==============================`);
    console.timeEnd(`All podcasts for category '${categoryId}' fetched in`);
    console.log(`==============================`);

    return true;
  },
};
