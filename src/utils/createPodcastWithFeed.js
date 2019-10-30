/* eslint-disable import/no-cycle */
/* eslint-disable no-loop-func */

import { get } from 'lodash';

import getPodcastPreview from './fetching/getPodcastPreview';
import getFeedData from './fetching/getFeedData';

import db from '../db';

const createPodcastWithFeed = async (itunesId, limit = 100) => {
  let feedData;
  let data;

  const podcastExists = await db.exists.Podcast({
    itunesId,
  });

  if (podcastExists) return;

  const previewData = await getPodcastPreview(itunesId);

  const { categoryIds } = previewData;
  delete previewData.categoryIds;

  data = {
    ...previewData,
    categories: {
      connect: categoryIds,
    },
  };

  try {
    feedData = await getFeedData(previewData.feedUrl);

    const { meta } = feedData;
    const { link, description: metaDesc } = meta;
    const description = get(meta, 'itunes:summary.#') || metaDesc || '';

    data = { ...data, websiteUrl: link || '', description };
  } finally {
    data = { ...data, feedCheckedAt: new Date() };
  }

  const podcast = await db.mutation.createPodcast({
    data,
  });

  if (feedData) {
    let index = 0;
    const { episodes } = feedData;
    const { id } = podcast;

    while (index <= episodes.length) {
      const items = episodes.slice(index, index + limit);

      await Promise.all(
        items.map(async episode => {
          if (!episode.title || !episode.mediaUrl) return;

          const ep = await db.mutation.createEpisode({
            data: {
              ...episode,
              podcast: {
                connect: {
                  id,
                },
              },
            },
          });

          return ep;
        })
      );

      index += limit;
    }
  }

  return podcast;
};

export default createPodcastWithFeed;
