import FeedParser from 'feedparser';

import getFeedStream from '../fetching/getFeedStream';

const getFeedMeta = async feedUrl =>
  new Promise(async (resolve, reject) => {
    if (!feedUrl)
      return reject(new Error('A podcast feedUrl was not provided.'));

    console.time(`  Meta for feed '${feedUrl}' fetched in `);

    const feedStream = await getFeedStream(feedUrl);
    const feedParser = new FeedParser();

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

export default getFeedMeta;
