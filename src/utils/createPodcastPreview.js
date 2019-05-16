import db from '../db';
import fetchPodcastPreview from './fetchPodcastPreview';

const createPodcastPreview = async preview => {
  const { itunesId, description } = preview;

  const podcastExists = await db.exists.Podcast({
    itunesId,
  });

  if (podcastExists) return;

  const podcastPreview = await fetchPodcastPreview(itunesId);

  if (!podcastPreview) return;

  try {
    const { categoryIds } = podcastPreview;
    delete podcastPreview.categoryIds;

    await db.mutation.createPodcast({
      data: {
        ...podcastPreview,
        description,
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
      description,
    });

    console.log(
      `==========================================================================================`
    );
  }
};

export default createPodcastPreview;
