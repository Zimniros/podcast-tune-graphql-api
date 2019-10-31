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

  const podcastExists = await db.exists.Podcast({
    itunesId,
  });

  if (podcastExists)
    throw new Error(`Podcast with itunesId '${itunesId}' already exists.'`);

  const previewData = await getPodcastPreview(itunesId);
  const metaData = await getFeedMeta(previewData.feedUrl);

  const { link, description: metaDesc } = metaData;
  const description = get(metaData, 'itunes:summary.#') || metaDesc || '';

  return db.mutation.createPodcast({
    data: {
      ...previewData,
      websiteUrl: link || '',
      description,
    },
  });
};

export default createPodcast;
