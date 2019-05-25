import FeedParser from 'feedparser';
import axios from 'axios';

import db from '../../db';

const populatePodcastUrl = async podcastId =>
  new Promise(async (resolve, reject) => {
    console.time(`Url for podcast with id '${podcastId}' fetched in `);

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

    feedParser.on('error', function(error) {
      return reject(error);
    });

    feedParser.on('meta', async function() {
      const context = this;
      const { meta } = context;
      const { link } = meta;

      if (!link) {
        console.log('error in link', { link });
        return reject(new Error('Link property on meta is empty.'));
      }

      await db.mutation.updatePodcast({
        where: {
          id: podcastId,
        },
        data: {
          websiteUrl: link,
        },
      });
      context.destroy();
      console.timeEnd(`Url for podcast with id '${podcastId}' fetched in `);
      return resolve(link);
    });

    feedStream.data.pipe(feedParser);
  });

export default populatePodcastUrl;
