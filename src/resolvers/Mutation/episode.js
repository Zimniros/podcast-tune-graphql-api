export default {
  async updateEpisodeDuration(parent, { id, duration }, { db }, info) {
    if (!id || id.trim().length === 0) {
      throw new Error(`Episode id is not provided.`);
    }

    const episode = await db.mutation.updateEpisode({
      where: {
        id,
      },
      data: {
        duration,
        durationVerified: true,
      },
      info,
    });

    return episode;
  },
  async setPlayingEpisode(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingQueueEpisode] = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
        position
      }`
    );

    let episodesToUpdate;
    let episodeToReturn;

    const [existingPlayedEpisode] = await db.query.playedEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingPlayedEpisode) {
      await db.mutation.deletePlayedEpisode({
        where: {
          id: existingPlayedEpisode.id,
        },
      });
    }

    if (existingQueueEpisode) {
      const { position } = existingQueueEpisode;

      episodesToUpdate = await db.query.queueEpisodes(
        {
          where: {
            user: { id: userId },
            position_lt: position,
            id_not: existingQueueEpisode.id,
          },
        },
        `{
          id
          position
        }`
      );

      episodeToReturn = await db.mutation.updateQueueEpisode(
        {
          where: {
            id: existingQueueEpisode.id,
          },
          data: {
            position: 1,
          },
        },
        info
      );
    } else {
      episodesToUpdate = await db.query.queueEpisodes(
        {
          where: {
            user: { id: userId },
          },
        },
        `{
          id
          position
        }`
      );

      episodeToReturn = await db.mutation.createQueueEpisode(
        {
          data: {
            position: 1,
            user: {
              connect: {
                id: userId,
              },
            },
            episode: {
              connect: { id },
            },
          },
        },
        info
      );
    }

    const episodesToUpdateMutations = [];

    for (const episode of episodesToUpdate) {
      const mutation = db.mutation.updateQueueEpisode(
        {
          data: { position: episode.position + 1 },
          where: { id: episode.id },
        },
        info
      );

      episodesToUpdateMutations.push(mutation);
    }

    await Promise.all(episodesToUpdateMutations);

    return episodeToReturn;
  },
  async addEpisodeToQueueNext(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const queue = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
        },
      },
      `{
        id

        episode {
          id
        }
      }`
    );

    const isEpisodeExistsInQueue = queue.some(
      ({ episode }) => episode.id === id
    );

    if (isEpisodeExistsInQueue) {
      throw new Error('Episode is already in queue!');
    }

    const position = queue.length ? 2 : 1;

    const episodeToReturn = await db.mutation.createQueueEpisode(
      {
        data: {
          position,
          user: {
            connect: {
              id: userId,
            },
          },
          episode: {
            connect: { id },
          },
        },
      },
      info
    );

    const episodesToUpdate = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          position_gt: 1,
          id_not: episodeToReturn.id,
        },
      },
      `{
        id
        position
      }`
    );

    const episodesToUpdateMutations = [];

    for (const episode of episodesToUpdate) {
      const mutation = db.mutation.updateQueueEpisode(
        {
          data: { position: episode.position + 1 },
          where: { id: episode.id },
        },
        info
      );

      episodesToUpdateMutations.push(mutation);
    }

    await Promise.all(episodesToUpdateMutations);

    return episodeToReturn;
  },
  async addEpisodeToQueueLast(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const queue = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
        },
      },
      `{
        id

        episode {
          id
        }
      }`
    );

    const isEpisodeExistsInQueue = queue.some(
      ({ episode }) => episode.id === id
    );

    if (isEpisodeExistsInQueue) {
      throw new Error('Episode is already in queue!');
    }

    const position = queue.length + 1;

    const episodeToReturn = await db.mutation.createQueueEpisode(
      {
        data: {
          position,
          user: {
            connect: {
              id: userId,
            },
          },
          episode: {
            connect: { id },
          },
        },
      },
      info
    );

    return episodeToReturn;
  },
  async removeEpisodeFromQueue(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingQueueEpisode] = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
        position
      }`
    );

    if (!existingQueueEpisode) {
      throw new Error(`Queue episode with id '${id}' is not found!`);
    }

    const { position } = existingQueueEpisode;

    const episodesToUpdate = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          position_gt: position,
          id_not: existingQueueEpisode.id,
        },
      },
      `{
          id
          position
        }`
    );

    const episodeToReturn = await db.mutation.deleteQueueEpisode(
      {
        where: {
          id: existingQueueEpisode.id,
        },
      },
      info
    );

    const episodesToUpdateMutations = [];

    for (const episode of episodesToUpdate) {
      const mutation = db.mutation.updateQueueEpisode(
        {
          data: { position: episode.position - 1 },
          where: { id: episode.id },
        },
        info
      );

      episodesToUpdateMutations.push(mutation);
    }

    await Promise.all(episodesToUpdateMutations);

    return episodeToReturn;
  },
  async addEpisodeToFavorites(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingFavoriteEpisode] = await db.query.favoriteEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingFavoriteEpisode) {
      throw new Error('Episode is already in favorites!');
    }

    const episodeToReturn = await db.mutation.createFavoriteEpisode(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          episode: {
            connect: { id },
          },
        },
      },
      info
    );

    return episodeToReturn;
  },
  async removeEpisodeFromFavorites(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingFavoriteEpisode] = await db.query.favoriteEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (!existingFavoriteEpisode) {
      throw new Error(`Favorite episode with id '${id}' is not found!`);
    }

    const episodeToReturn = await db.mutation.deleteFavoriteEpisode(
      {
        where: {
          id: existingFavoriteEpisode.id,
        },
      },
      info
    );

    return episodeToReturn;
  },
  async setPlayedTime(parent, { id, playedTime }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingInProgressEpisode] = await db.query.inProgressEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    let episodeToReturn;

    if (existingInProgressEpisode) {
      episodeToReturn = await db.mutation.updateInProgressEpisode(
        {
          where: {
            id: existingInProgressEpisode.id,
          },
          data: {
            playedTime,
          },
        },
        info
      );
    } else {
      episodeToReturn = await db.mutation.createInProgressEpisode(
        {
          data: {
            playedTime,
            user: {
              connect: {
                id: userId,
              },
            },
            episode: {
              connect: { id },
            },
          },
        },
        info
      );
    }

    return episodeToReturn;
  },
  async markEpisodeAsPlayed(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingPlayedEpisode] = await db.query.playedEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingPlayedEpisode) {
      throw new Error('Episode already marked as played!');
    }

    const mutationsToPerform = [];

    const [existingInProgressEpisode] = await db.query.inProgressEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingInProgressEpisode) {
      const mutation = db.mutation.deleteInProgressEpisode({
        where: {
          id: existingInProgressEpisode.id,
        },
      });

      mutationsToPerform.push(mutation);
    }

    const [existingQueueEpisode] = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
        position
      }`
    );

    let episodesToUpdate = [];

    if (existingQueueEpisode) {
      const mutation = db.mutation.deleteQueueEpisode({
        where: {
          id: existingQueueEpisode.id,
        },
      });

      mutationsToPerform.push(mutation);

      const { position } = existingQueueEpisode;

      episodesToUpdate = await db.query.queueEpisodes(
        {
          where: {
            user: { id: userId },
            position_gt: position,
            id_not: existingQueueEpisode.id,
          },
        },
        `{
          id
          position
        }`
      );
    }

    for (const episode of episodesToUpdate) {
      const mutation = db.mutation.updateQueueEpisode(
        {
          data: { position: episode.position - 1 },
          where: { id: episode.id },
        },
        info
      );

      mutationsToPerform.push(mutation);
    }

    await Promise.all(mutationsToPerform);

    const episodeToReturn = await db.mutation.createPlayedEpisode(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          episode: {
            connect: { id },
          },
        },
      },
      info
    );

    return episodeToReturn;
  },
  async markEpisodeAsUnplayed(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingPlayedEpisode] = await db.query.playedEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (!existingPlayedEpisode) {
      throw new Error(`Played episode with id '${id}' is not found!`);
    }

    const episodeToReturn = await db.mutation.deletePlayedEpisode(
      {
        where: {
          id: existingPlayedEpisode.id,
        },
      },
      info
    );

    return episodeToReturn;
  },
};
