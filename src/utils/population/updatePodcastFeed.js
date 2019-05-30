/* eslint-disable no-loop-func */
import getFeedData from './getFeedData';
import db from '../../db';

const updatePodcastFeed = (id, info) =>
  new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error('A podcast ituidnesId was not provided.'));

    let feedData;
    const newEpisodes = [];

    const podcast = await db.query.podcast({
      where: {
        id,
      },
    });

    if (!podcast)
      return reject(new Error(`Podcast with id '${id}' was not found.'`));

    if (podcast.isFeedUpdating)
      return reject(new Error(`Podcast with id '${id}' is updating already.'`));

    try {
      console.log(`======================================================`);
      console.log(`Updating feed for podcast (id: '${id}').`);
      console.time(`Feed for podcast updated in (id: '${id}')`);

      await db.mutation.updatePodcast({
        where: {
          id,
        },
        data: {
          isFeedUpdating: true,
        },
      });

      try {
        const { feedUrl } = podcast;
        feedData = await getFeedData(feedUrl);
      } catch (error) {
        console.log('Error in fetching podcast feed', {
          id,
          error: error.message,
        });

        return reject(error);
      } finally {
        await db.mutation.updatePodcast({
          where: {
            id,
          },
          data: {
            feedCheckedAt: new Date(),
          },
        });
      }

      const { episodes } = feedData;

      for (const episode of episodes) {
        try {
          const { title, mediaUrl } = episode;
          if (!title || !mediaUrl) return;

          const existingEpisodes = await db.query.episodes(
            {
              where: {
                title,
                mediaUrl,
                podcast: {
                  id,
                },
              },
            },
            info
          );

          if (existingEpisodes.length !== 0) {
            return resolve(newEpisodes);
          }

          const ep = await db.mutation.createEpisode(
            {
              data: {
                ...episode,
                podcast: {
                  connect: {
                    id,
                  },
                },
              },
            },
            info
          );

          newEpisodes.push(ep);
        } catch (error) {
          console.log(
            `Error in creating episode in updatePodcastFeed method.`,
            {
              error: error.message,
            }
          );
        }
      }
    } finally {
      await db.mutation.updatePodcast({
        where: {
          id,
        },
        data: {
          isFeedUpdating: false,
        },
      });

      console.timeEnd(`Feed for podcast updated in (id: '${id}')`);
      console.log(`======================================================`);
    }
  });

export default updatePodcastFeed;
