/* eslint-disable no-loop-func */

import { get } from 'lodash';

import fetchPodcastPreview from './fetchPodcastPreview';
import getFeedData from './population/getFeedData';

import db from '../db';

const createPodcastWithFeed = (itunesId, limit = 100) =>
  new Promise(async (resolve, reject) => {
    if (!itunesId)
      return reject(new Error('A podcast itunesId was not provided.'));
    if (Number.isNaN(itunesId))
      return reject(new Error('A itunesId must be a number.'));

    let previewData;
    let feedData;
    let data;
    let podcast;

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
      feedData = await getFeedData(previewData.feedUrl);

      const { meta } = feedData;
      const { link, description: metaDesc } = meta;
      const description = get(meta, 'itunes:summary.#') || metaDesc || '';

      data = { ...data, websiteUrl: link || '', description };
    } catch (error) {
      console.log('Error in fetching podcast feed', {
        itunesId,
        error: error.message,
      });
    }

    try {
      podcast = await db.mutation.createPodcast({
        data,
      });
    } catch (error) {
      console.log('Error in creating podcast', { itunesId });
      return reject(error);
    }

    if (feedData) {
      try {
        let index = 0;
        const { episodes } = feedData;
        const { id, title } = podcast;

        while (index <= episodes.length) {
          const items = episodes.slice(index, index + limit);

          await Promise.all(
            items.map(
              episode =>
                new Promise(async (resolve, reject) => {
                  if (!episode.title || !episode.mediaUrl) return;

                  try {
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

                    return resolve(ep);
                  } catch (error) {
                    console.log(
                      `Error during creating episode for podcast '${title}'`,
                      {
                        error: error.message,
                        episode,
                      }
                    );
                    return reject(error);
                  }
                })
            )
          );

          index += limit;
        }
      } catch (error) {
        console.log('Error in creating feed for podcast', {
          itunesId,
          podcast,
        });
        return reject(error);
      }
    }

    return resolve(podcast);
  });

export default createPodcastWithFeed;
