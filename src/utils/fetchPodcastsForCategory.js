import { find } from 'lodash';
import fetchPodcastPreview from './fetchPodcastPreview';
import fetchTopPodcasts from './fetchTopPodcasts';
import db from '../db';

const fetchPodcastsForCategory = async ({ categoryId, limit }) => {
  const previewsData = await fetchTopPodcasts({ categoryId, limit });

  for (const preview of previewsData) {
    const { itunesId } = preview;

    const podcastExists = await db.exists.Podcast({
      itunesId,
    });

    if (!podcastExists) {
      const podcastPreview = await fetchPodcastPreview(itunesId);

      if (!podcastPreview) return;

      try {
        const { categoryIds } = podcastPreview;
        delete podcastPreview.categoryIds;

        await db.mutation.createPodcast({
          data: {
            ...find(previewsData, { itunesId }),
            ...podcastPreview,
            categories: {
              connect: categoryIds,
            },
          },
        });
      } catch (error) {
        console.log(
          `Error during fetching preview for podcast '${
            podcastPreview.title
          }' (ItunesId: ${podcastPreview.itunesId})`
        );
        console.log(
          `==========================================================================================`
        );

        console.log({
          podcastExists,
          podcastPreview,
          '...find(previewsData, { itunesId })': {
            ...find(previewsData, { itunesId }),
          },
        });

        console.log(
          `==========================================================================================`
        );
      }
    }
  }

  // await Promise.all(
  //   previewsData.map(async preview => {
  //     const { itunesId } = preview;

  //     const podcastExists = await db.exists.Podcast({
  //       itunesId,
  //     });

  //     if (!podcastExists) {
  //       const podcastPreview = await fetchPodcastPreview(itunesId);
  //       const { categoryIds } = podcastPreview;
  //       delete podcastPreview.categoryIds;

  //       try {
  //         await db.mutation.createPodcast({
  //           data: {
  //             ...find(previewsData, { itunesId }),
  //             ...podcastPreview,
  //             categories: {
  //               connect: categoryIds,
  //             },
  //           },
  //         });
  //       } catch (error) {
  //         console.log(
  //           `Error during fetching preview for podcast '${
  //             podcastPreview.title
  //           }' (ItunesId: ${podcastPreview.itunesId})`
  //         );
  //       }
  //     }
  //   })
  // );
};

export default fetchPodcastsForCategory;
