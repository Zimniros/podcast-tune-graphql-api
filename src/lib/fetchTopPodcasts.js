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

const fetchTopPodcasts = async categoryId => {
  console.time(`fetchTopPodcasts-${categoryId}`);

  const jsonData = await axios(
    `https://itunes.apple.com/us/rss/topaudiopodcasts/limit=50/genre=${categoryId}/json`
  );

  const feedData = jsonData.data.feed.entry;
  const previewsData = prettifyPreviewData(feedData);

  console.timeEnd(`fetchTopPodcasts-${categoryId}`);

  return previewsData;
};

export default fetchTopPodcasts;
