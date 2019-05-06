import fetchGenres from '../lib/fetchGenres';

const Mutations = {
  async getGenres(parent, args, ctx, info) {
    const genresData = await fetchGenres();
    await ctx.db.mutation.deleteManyGenres();

    const promises = [];

    genresData.forEach(genre => {
      const upsertPromise = ctx.db.mutation.createGenre({
        data: {
          ...genre,
        },
      });
      promises.push(upsertPromise);
    });

    const genres = await Promise.all(promises);

    return genres;
  },
};

export { Mutations as default };
