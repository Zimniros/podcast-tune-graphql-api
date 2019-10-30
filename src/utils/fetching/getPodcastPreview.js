import fetchPodcastPreview from './fetchPodcastPreview';
import prettifyPreviewData from '../prettifyPreviewData';

const getPodcastPreview = async itunesId => {
  const results = await fetchPodcastPreview(itunesId);

  const data = prettifyPreviewData(results[0]);

  return data;
};

export default getPodcastPreview;
