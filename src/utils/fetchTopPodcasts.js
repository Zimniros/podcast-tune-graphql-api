import axios from 'axios';

function getItunesId(data) {
  return +data.id.attributes['im:id'];
}

function getSummary(data) {
  return data.summary ? data.summary.label : '';
}

function prettifyPreviewData(data) {
  if (Array.isArray(data)) {
    return data.map(el => ({
      itunesId: getItunesId(el),
      description: getSummary(el),
    }));
  }

  if (typeof data === 'object') {
    return {
      itunesId: getItunesId(data),
      description: getSummary(data),
    };
  }
}

const fetchTopPodcasts = async ({ categoryId, limit, country }) => {
  console.time(`  Top podcasts for ${categoryId} fetched in`);

  const jsonData = await axios(
    `https://itunes.apple.com/${country}/rss/topaudiopodcasts/limit=${limit}/genre=${categoryId}/json`
  );

  const feedData = jsonData.data.feed.entry;
  const previewsData = prettifyPreviewData(feedData);

  console.timeEnd(`  Top podcasts for ${categoryId} fetched in`);

  return previewsData;
};

export default fetchTopPodcasts;
