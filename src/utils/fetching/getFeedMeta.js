import FeedParser from 'feedparser';

import fetchFeedStream from './fetchFeedStream';

const getFeedMeta = async feedUrl => {
  const feedStream = await fetchFeedStream(feedUrl);
  console.time(`  Data for feed '${feedUrl}' fetched in `);

  return new Promise((resolve, reject) => {
    const feedParser = new FeedParser();
    console.time(`  Meta for feed '${feedUrl}' fetched in `);

    feedParser.on('error', function(error) {
      return reject(error);
    });

    feedParser.on('meta', function() {
      const context = this;
      const { meta } = context;

      context.destroy();
      return resolve(meta);
    });

    feedParser.on('end', function() {
      console.timeEnd(`  Meta for feed '${feedUrl}' fetched in `);
    });

    feedStream.data.pipe(feedParser);
  });
};
export default getFeedMeta;
