import bcrypt from 'bcryptjs';

import fetchCategories from '../utils/population/fetchCategories';
import fetchPodcastsForCategory from '../utils/population/fetchPodcastsForCategory';
import generateCookie from '../utils/generateCookie';

const Mutations = {
  async register(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();

    const password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      },
      info
    );

    ctx.response.cookie(...generateCookie(user.id));

    return user;
  },
  async login(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user(
      {
        where: {
          email,
        },
      },
      info
    );

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid Password!');
    }

    ctx.response.cookie(...generateCookie(user.id));

    return user;
  },
  /*
      Data population methods
  */

  // Initial Data Population for Categories
  async getCategories(parent, args, { db }, info) {
    const categoriesData = await fetchCategories();
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

export { Mutations as default };
