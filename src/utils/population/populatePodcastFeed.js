import FeedParser from 'feedparser';
import axios from 'axios';

import db from '../../db';
import prettifyEpisodeData from '../prettifyEpisodeData';

const populatePodcastFeed = async podcastId =>
  new Promise(async (resolve, reject) => {
    console.time(`Feed for podcast with id '${podcastId}' fetched in `);

    const podcast = await db.query.podcast({
      where: {
        id: podcastId,
      },
    });

    if (!podcast) {
      return reject(new Error(`Podcast with id ${podcastId} was not found.`));
    }

    const { feedUrl, title } = podcast;

    let feedStream;

    try {
      feedStream = await axios({
        method: 'get',
        url: feedUrl,
        responseType: 'stream',
      });
    } catch (error) {
      console.log(`Error during creating stream for podcast '${title}' feed.`, {
        error,
      });
      return reject(error);
    }

    const feedParser = new FeedParser();
    const feed = [];

    feedParser.on('error', function(error) {
      return reject(error);
    });

    feedParser.on('readable', async function() {
      const context = this; // `this` is `feedparser`, which is a stream
      const episode = context.read();

      if (episode != null) {
        const episodeData = prettifyEpisodeData(episode);

        if (!episodeData.title || !episodeData.mediaUrl) return;

        try {
          const ep = await db.mutation.createEpisode({
            data: {
              ...episodeData,
              podcast: {
                connect: {
                  id: podcastId,
                },
              },
            },
          });

          feed.push(ep);
        } catch (error) {
          console.log(`Error during creating episode for podcast '${title}'`, {
            error,
            episodeData,
          });
          return reject(error);
        }
      } else {
        context.destroy();
        return resolve(feed);
      }
    });

    feedParser.on('end', async function() {
      await db.mutation.updatePodcast({
        where: {
          id: podcastId,
        },
        data: {
          feedCheckedAt: new Date(),
        },
      });
      console.timeEnd(`Feed for podcast with id '${podcastId}' fetched in `);
    });

    feedStream.data.pipe(feedParser);
  });

export default populatePodcastFeed;
