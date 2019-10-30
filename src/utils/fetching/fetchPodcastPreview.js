import axios from 'axios';

const fetchPodcastPreview = async itunesId => {
  const jsonData = await axios.get(
    `https://itunes.apple.com/lookup?id=${itunesId}&entity=podcast`
  );

  const { results } = jsonData.data;

  return results;
};

export default fetchPodcastPreview;
