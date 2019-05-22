import fetchTopPodcasts from './fetchTopPodcasts';
import createPodcastPreview from './createPodcastPreview';

const fetchPodcastsForCategory = async ({ categoryId, limit, country }) => {
  const previewsData = await fetchTopPodcasts({ categoryId, limit, country });

  let index = 0;
  const range = 20;

  while (index <= previewsData.length) {
    const previews = previewsData.slice(index, index + range);
    await Promise.all(previews.map(preview => createPodcastPreview(preview)));
    index += range;
  }
};

export default fetchPodcastsForCategory;
