import axios from 'axios';

function prettifyPreviewData(data) {
  return {
    itunesId: data.collectionId,
    title: data.trackName,
    author: data.artistName,
    feedUrl: data.feedUrl,
    itunesUrl: data.collectionViewUrl,
    artworkSmall: data.artworkUrl100,
    artworkLarge: data.artworkUrl600,
    categoryIds: data.genreIds
      .filter(id => id !== '26')
      .map(id => ({ itunesId: +id })),
  };
}

const fetchPodcastPreview = async itunesId =>
  new Promise(async (resolve, reject) => {
    if (!itunesId)
      return reject(new Error('A podcast itunesId was not provided.'));

    let jsonData;
    try {
      jsonData = await axios.get(
        `https://itunes.apple.com/lookup?id=${itunesId}&entity=podcast`
      );
    } catch (error) {
      return reject(error);
    }

    const { resultCount, results } = jsonData.data;

    if (resultCount === 0) {
      return reject(new Error(`There's not any data for podcast ${itunesId}.`));
    }

    const data = prettifyPreviewData(results[0]);
    return resolve(data);
  });

export default fetchPodcastPreview;
