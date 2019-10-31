import fetchPodcastPreview from './fetchPodcastPreview';
import prettifyPreviewData from '../prettifyPreviewData';

const getPodcastPreview = async itunesId => {
  const result = await fetchPodcastPreview(itunesId);

  return prettifyPreviewData(result);
};

export default getPodcastPreview;
