const Subscription = {
  episode: {
    subscribe(parent, { podcastId }, { db }, info) {
      return db.subscription.episode(
        {
          where: {
            node: {
              podcast: {
                id: podcastId,
              },
            },
          },
        },
        info
      );
    },
  },
};

export default Subscription;
