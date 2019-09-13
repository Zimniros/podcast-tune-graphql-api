import FeedParser from 'feedparser';

import prettifyEpisodeData from '../prettifyEpisodeData';
import fetchFeedStream from './fetchFeedStream';

const getFeedData = async feedUrl => {
  const feedStream = await fetchFeedStream(feedUrl);
  console.time(`  Data for feed '${feedUrl}' fetched in `);

  const feed = {
    meta: null,
    episodes: [],
  };

  return new Promise((resolve, reject) => {
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
};

export default getFeedData;
