const Query = {
  async genres(parent, args, ctx, info) {
    const genres = await ctx.db.query.genres();

    return genres;
  },
};

export { Query as default };
