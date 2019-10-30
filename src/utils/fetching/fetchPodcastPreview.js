import axios from 'axios';

const fetchPodcastPreview = async itunesId => {
  const jsonData = await axios.get(
    `https://itunes.apple.com/lookup?id=${itunesId}&entity=podcast`
  );

  const { resultCount, results } = jsonData.data;

  if (resultCount === 0) {
    throw new Error(`There's not any data for podcast ${itunesId}.`);
  }

  return results;
};

export default fetchPodcastPreview;
