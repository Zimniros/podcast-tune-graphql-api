import FeedParser from 'feedparser';
import axios from 'axios';

import prettifyEpisodeData from '../prettifyEpisodeData';

const getFeedData = async feedUrl =>
  new Promise(async (resolve, reject) => {
    if (!feedUrl)
      return reject(new Error('A podcast feedUrl was not provided.'));

    console.time(`  Data for feed '${feedUrl}' fetched in `);

    let feedStream;
    const feed = {
      meta: null,
      episodes: [],
    };

    try {
      feedStream = await axios({
        method: 'get',
        url: feedUrl,
        responseType: 'stream',
        timeout: 30000,
      });
    } catch (error) {
      return reject(error);
    }

    const feedParser = new FeedParser();

    feedParser.on('error', function(error) {
      return reject(error);
    });

    feedParser.on('readable', function() {
      const context = this; // `this` is `feedparser`, which is a stream
      const episode = context.read();

      if (episode != null) {
        const episodeData = prettifyEpisodeData(episode);

        if (!episodeData.title || !episodeData.mediaUrl) return;

        feed.episodes.push(episodeData);
      } else {
        feed.meta = this.meta;
        context.destroy();
        return resolve(feed);
      }
    });

    feedParser.on('end', function() {
      console.timeEnd(`  Data for feed '${feedUrl}' fetched in `);
    });

    feedStream.data.pipe(feedParser);
  });

export default getFeedData;
