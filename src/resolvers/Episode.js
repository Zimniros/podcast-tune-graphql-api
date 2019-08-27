const Episode = {
  isInFavorites: {
    fragment: 'fragment episodeId on Episode { id }',
    async resolve(parent, args, { request, db }, info) {
      const { userId } = request;

      if (!userId) {
        return false;
      }

      const [existingFavoriteEpisode] = await db.query.favoriteEpisodes(
        {
          where: {
            user: { id: userId },
            episode: { id: parent.id },
          },
        },
        `{
          id
        }`
      );

      return Boolean(existingFavoriteEpisode);
    },
  },
};

export default Episode;
