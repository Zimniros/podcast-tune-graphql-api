import { get } from 'lodash';

import fetchPodcastPreview from './fetchPodcastPreview';
import getFeedMeta from './population/getFeedMeta';
import db from '../db';

const createPodcast = itunesId =>
  new Promise(async (resolve, reject) => {
    if (!itunesId)
      return reject(new Error('A podcast itunesId was not provided.'));
    if (Number.isNaN(itunesId))
      return reject(new Error('A itunesId must be a number.'));

    let previewData;
    let metaData;
    let data;

    const podcastExists = await db.exists.Podcast({
      itunesId,
    });

    if (podcastExists)
      return reject(
        new Error(`Podcast with itunesId '${itunesId}' already exists.'`)
      );

    try {
      previewData = await fetchPodcastPreview(itunesId);

      const { categoryIds } = previewData;
      delete previewData.categoryIds;

      data = {
        ...previewData,
        categories: {
          connect: categoryIds,
        },
      };
    } catch (error) {
      console.log('Error in fetching podcast preview', { itunesId });
      return reject(error);
    }

    try {
      metaData = await getFeedMeta(previewData.feedUrl);

      const { link, description: metaDesc } = metaData;
      const description = get(metaData, 'itunes:summary.#') || metaDesc || '';

      data = { ...data, websiteUrl: link || '', description };
    } catch (error) {
      console.log('Error in fetching podcast meta', { itunesId });
      return reject(error);
    }

    try {
      const podcast = await db.mutation.createPodcast({
        data,
      });

      return resolve(podcast);
    } catch (error) {
      console.log('Error in creating podcast', { itunesId });
      return reject(error);
    }
  });

export default createPodcast;
