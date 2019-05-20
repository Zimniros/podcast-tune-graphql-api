import FeedParser from 'feedparser';
import axios from 'axios';
import { pick, get } from 'lodash';

function filterEnclosures(enclosures) {
  const array = Array.isArray(enclosures) ? enclosures : [enclosures];

  return array.find(el => el.type === 'audio/mpeg');
}

function parseDuration(duration) {
  const dur = parseInt(duration);
  return Number.isNaN(dur) ? undefined : dur;
}

const getPodcastFeed = async feedUrl => {
  console.time(`Feed '${feedUrl}' fetched in `);
  return new Promise(async (resolve, reject) => {
    const feedStream = await axios({
      method: 'get',
      url: feedUrl,
      responseType: 'stream',
    });

    const feedParser = new FeedParser();

    const feed = {
      meta: null,
      episodes: [],
    };

    feedParser.on('error', function(error) {
      throw reject(error);
    });

    feedParser.on('readable', function() {
      const context = this; // `this` is `feedparser`, which is a stream
      const episode = context.read();

      if (episode != null) {
        const enclosure = filterEnclosures(get(episode, 'enclosures'));

        const data = {
          ...pick(episode, [
            'title',
            'description',
            'pubDate',
            'author',
            'link',
          ]),
          mediaUrl: enclosure && enclosure.url,
          duration: enclosure && parseDuration(enclosure.length),
          durationVerified: !enclosure && true,
        };

        feed.episodes.push(data);
      } else {
        feed.meta = this.meta;
        context.destroy();
        return resolve(feed);
      }
    });

    feedParser.on('end', function() {
      console.timeEnd(`Feed '${feedUrl}' fetched in `);
    });

    feedStream.data.pipe(feedParser);
  });
};

export default getPodcastFeed;
