import axios from 'axios';

function getItunesId(data) {
  return +data.id.attributes['im:id'];
}

function prettifyPreviewData(data) {
  if (Array.isArray(data)) {
    return data.map(el => getItunesId(el));
  }

  if (typeof data === 'object') {
    return getItunesId(data);
  }
}

const fetchTopPodcasts = async ({ categoryId, limit = 200, country = 'US' }) =>
  new Promise(async (resolve, reject) => {
    if (!categoryId) return reject(new Error('A categoryId was not provided.'));

    console.time(`  Top podcasts for ${categoryId} fetched in`);

    let jsonData;

    try {
      jsonData = await axios(
        `https://itunes.apple.com/${country}/rss/topaudiopodcasts/limit=${limit}/genre=${categoryId}/json`
      );
    } catch (error) {
      return reject(error);
    }

    const feedData = jsonData.data.feed.entry;
    const podcastsIds = prettifyPreviewData(feedData);

    console.timeEnd(`  Top podcasts for ${categoryId} fetched in`);
    return resolve(podcastsIds);
  });

export default fetchTopPodcasts;
