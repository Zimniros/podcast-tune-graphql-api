import fetchPodcastPreview from './fetchPodcastPreview';
import prettifyPreviewData from '../prettifyPreviewData';

const getPodcastPreview = async itunesId => {
  const result = await fetchPodcastPreview(itunesId);

  const data = prettifyPreviewData(result);

  return data;
};

export default getPodcastPreview;
