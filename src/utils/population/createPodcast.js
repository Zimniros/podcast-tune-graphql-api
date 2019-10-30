/* eslint-disable import/no-cycle */
import { get } from 'lodash';

import getPodcastPreview from '../fetching/getPodcastPreview';
import getFeedMeta from '../fetching/getFeedMeta';
import db from '../../db';

const createPodcast = async itunesId => {
  if (!itunesId)
    throw new Error(
      'A podcast itunesId was not provided for createPodcast method.'
    );

  let data;

  const podcastExists = await db.exists.Podcast({
    itunesId,
  });

  if (podcastExists)
    throw new Error(`Podcast with itunesId '${itunesId}' already exists.'`);

  const previewData = await getPodcastPreview(itunesId);

  const { categoryIds } = previewData;
  delete previewData.categoryIds;

  data = {
    ...previewData,
    categories: {
      connect: categoryIds,
    },
  };

  const metaData = await getFeedMeta(previewData.feedUrl);

  const { link, description: metaDesc } = metaData;
  const description = get(metaData, 'itunes:summary.#') || metaDesc || '';

  data = { ...data, websiteUrl: link || '', description };

  const podcast = await db.mutation.createPodcast({
    data,
  });

  return podcast;
};

export default createPodcast;
