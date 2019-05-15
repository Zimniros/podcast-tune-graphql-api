import axios from 'axios';

function getItunesId(data) {
  return +data.id.attributes['im:id'];
}

function getSummary(data) {
  return data.summary ? data.summary.label : '';
}

function prettifyPreviewData(data) {
  return data.map(el => ({
    itunesId: getItunesId(el),
    description: getSummary(el),
  }));
}

const fetchTopPodcasts = async ({ categoryId, limit }) => {
  console.time(`  Top podcasts for ${categoryId} fetched in`);

  const jsonData = await axios(
    `https://itunes.apple.com/us/rss/topaudiopodcasts/limit=${limit}/genre=${categoryId}/json`
  );

  const feedData = jsonData.data.feed.entry;
  const previewsData = prettifyPreviewData(feedData);

  console.timeEnd(`  Top podcasts for ${categoryId} fetched in`);

  return previewsData;
};

export default fetchTopPodcasts;
