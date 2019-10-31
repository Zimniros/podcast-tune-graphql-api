/* eslint-disable import/no-cycle */
/* eslint-disable no-loop-func */

import { get } from 'lodash';

import getPodcastPreview from '../fetching/getPodcastPreview';
import getFeedData from '../fetching/getFeedData';

import db from '../../db';

const createPodcastWithFeed = async (itunesId, limit = 100) => {
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
  const feedData = await getFeedData(previewData.feedUrl);

  const { meta } = feedData;
  const { link, description: metaDesc } = meta;
  const description = get(meta, 'itunes:summary.#') || metaDesc || '';

  const podcast = await db.mutation.createPodcast({
    data: {
      ...previewData,
      websiteUrl: link || '',
      description,
    },
  });

  try {
    if (feedData) {
      let index = 0;
      const { episodes } = feedData;
      const { id } = podcast;

      while (index <= episodes.length) {
        const items = episodes.slice(index, index + limit);
        const episodesToCreateMutations = [];

        items.forEach(episode => {
          const mutation = db.mutation.createEpisode({
            data: {
              ...episode,
              podcast: {
                connect: {
                  id,
                },
              },
            },
          });

          episodesToCreateMutations.push(mutation);
        });

        await Promise.all(
          episodesToCreateMutations.map(p => p.catch(e => console.log({ e })))
        );
        index += limit;
      }
    }
  } finally {
    await db.mutation.updatePodcast({
      where: {
        id: podcast.id,
      },
      data: {
        feedCheckedAt: new Date(),
      },
    });
  }

  return podcast;
};

export default createPodcastWithFeed;
