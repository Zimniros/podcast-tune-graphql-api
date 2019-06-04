import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import fetchCategories from '../utils/population/fetchCategories';
import fetchPodcastsForCategory from '../utils/population/fetchPodcastsForCategory';
import updatePodcastFeed from '../utils/population/updatePodcastFeed';

const Mutations = {
  async register(parent, { email, password, name }, ctx, info) {
    if (!email || email.trim().length === 0) {
      throw new Error(`Email is not provided.`);
    }

    if (!password || password.trim().length === 0) {
      throw new Error(`Password is not provided.`);
    }

    const emailLC = email.toLowerCase();

    const userExists = await ctx.db.exists.User({
      email,
    });

    if (userExists) {
      throw new Error(`Email is already found in our database`);
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          email: emailLC,
          name,
          password: encryptedPassword,
          permissions: { set: ['USER'] },
        },
      },
      info
    );

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },
  async login(parent, { email, password }, ctx, info) {
    if (!email || email.trim().length === 0) {
      throw new Error(`Email is not provided.`);
    }

    if (!password || password.trim().length === 0) {
      throw new Error(`Password is not provided.`);
    }

    const user = await ctx.db.query.user({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid Password!');
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },
  logout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
  async updatePodcastFeed(parent, { id }, ctx, info) {
    const episodes = await updatePodcastFeed(id, info);

    return episodes;
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
