import { find } from 'lodash';
import fetchPodcastPreview from './fetchPodcastPreview';
import fetchTopPodcasts from './fetchTopPodcasts';
import db from '../db';

const fetchPodcastsForCategory = async categoryId => {
  console.time(`fetchPodcastsForCategory-${categoryId}`);
  const previewsData = await fetchTopPodcasts(categoryId);

  await Promise.all(
    previewsData.map(async preview => {
      const { itunesId } = preview;

      const podcastExists = await db.exists.Podcast({
        itunesId,
      });

      if (!podcastExists) {
        const podcastPreview = await fetchPodcastPreview(itunesId);

        try {
          await db.mutation.createPodcast({
            data: {
              ...find(previewsData, { itunesId }),
              ...podcastPreview,
            },
          });
        } catch (error) {
          console.log(error.message);
        }
      }

      if (podcastExists) {
        console.log(`podcast ${itunesId} already exists.`);
      }
    })
  );

  console.timeEnd(`fetchPodcastsForCategory-${categoryId}`);
};

export default fetchPodcastsForCategory;
