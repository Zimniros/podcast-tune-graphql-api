import axios from 'axios';

function prettifyPreviewData(data) {
  return {
    itunesId: data.collectionId,
    title: data.trackName,
    author: data.artistName,
    feedUrl: data.feedUrl,
    artworkSmall: data.artworkUrl100,
    artworkLarge: data.artworkUrl600,
    categoryIds: data.genreIds
      .filter(id => id !== '26')
      .map(id => ({ itunesId: +id })),
  };
}

const fetchPodcastPreview = async podcastId => {
  const jsonData = await axios.get(
    `https://itunes.apple.com/lookup?id=${podcastId}`
  );

  const { resultCount, results } = jsonData.data;
  if (resultCount === 0) {
    console.log(`There's not any data for podcast ${podcastId}.`);
    return null;
  }

  const data = prettifyPreviewData(results[0]);
  return data;
};

export default fetchPodcastPreview;
