const Query = {
  async categories(parent, args, ctx, info) {
    const categories = await ctx.db.query.categories();

    return categories;
  },
};

export { Query as default };
