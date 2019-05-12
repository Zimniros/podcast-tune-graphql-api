import bcrypt from 'bcryptjs';

import fetchCategories from '../utils/fetchCategories';
import fetchPodcastsForCategory from '../utils/fetchPodcastsForCategory';
import generateCookie from '../utils/generateCookie';

const Mutations = {
  // Initial Data Population for Categories
  async getCategories(parent, args, ctx, info) {
    const categoriesData = await fetchCategories();
    await ctx.db.mutation.deleteManyCategories();

    const promises = [];

    categoriesData.forEach(category => {
      const upsertPromise = ctx.db.mutation.createCategory({
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
  async getPodcastsForAllCategories(parent, { limit = 200 }, ctx, info) {
    const categories = await ctx.db.query.categories();

    // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop/37576787#37576787

    console.time('getPodcastsForAllCategories');

    for (const category of categories) {
      const { itunesId } = category;
      await fetchPodcastsForCategory({ categoryId: itunesId, limit });
    }

    console.timeEnd('getPodcastsForAllCategories');

    return true;
  },
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
};

export { Mutations as default };
