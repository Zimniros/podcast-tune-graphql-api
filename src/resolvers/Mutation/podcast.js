import updatePodcastFeed from '../../utils/population/updatePodcastFeed';

export default {
  async updatePodcastFeed(parent, { id }, ctx, info) {
    const episodes = await updatePodcastFeed(id, info);

    return episodes;
  },

  async subscribeToPodcast(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingSubscribedPodcast] = await db.query.subscribedPodcasts(
      {
        where: {
          user: { id: userId },
          podcast: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingSubscribedPodcast) {
      throw new Error('Already subscribed to this podcast!');
    }

    const podcastToReturn = await db.mutation.createSubscribedPodcast(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          podcast: {
            connect: { id },
          },
        },
      },
      info
    );

    return podcastToReturn;
  },
  async unsubscribeFromPodcast(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingSubscribedPodcast] = await db.query.subscribedPodcasts(
      {
        where: {
          user: { id: userId },
          podcast: { id },
        },
      },
      `{
        id
      }`
    );

    if (!existingSubscribedPodcast) {
      throw new Error(`Subscribed podcast with id '${id}' is not found!`);
    }

    const podcastToReturn = await db.mutation.deleteSubscribedPodcast(
      {
        where: {
          id: existingSubscribedPodcast.id,
        },
      },
      info
    );

    return podcastToReturn;
  },
};
