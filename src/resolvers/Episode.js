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
  isInQueue: {
    fragment: 'fragment episodeId on Episode { id }',
    async resolve(parent, args, { request, db }, info) {
      const { userId } = request;

      if (!userId) {
        return false;
      }

      const [existingQueueEpisode] = await db.query.queueEpisodes(
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

      return Boolean(existingQueueEpisode);
    },
  },
};

export default Episode;
