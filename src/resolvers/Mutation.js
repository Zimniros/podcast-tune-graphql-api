import fetchCategories from '../lib/fetchCategories';

const Mutations = {
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
};

export { Mutations as default };
