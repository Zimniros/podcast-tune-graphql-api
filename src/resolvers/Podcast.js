const Podcast = {
  isSubscribedTo: {
    fragment: 'fragment podcastId on Podcast { id }',
    async resolve(parent, args, { request, db }, info) {
      const { userId } = request;

      if (!userId) {
        return false;
      }

      const [existingSubscribedPodcast] = await db.query.subscribedPodcasts(
        {
          where: {
            user: { id: userId },
            podcast: { id: parent.id },
          },
        },
        `{
          id
        }`
      );

      return Boolean(existingSubscribedPodcast);
    },
  },
};

export default Podcast;
