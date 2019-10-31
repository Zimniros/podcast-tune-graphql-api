import createPodcastWithFeed from '../createPodcastWithFeed';
import seedDatabase, { podcastOne } from '../../testUtils/seedDatabase';
import db from '../../../db';

import getPodcastPreview from '../../fetching/getPodcastPreview';
import getFeedData from '../../fetching/getFeedData';

import { prettifiedResult } from '../../seeds/podcastPreview';
import { rawData } from '../../seeds/feedData';

jest.mock('./../../fetching/getPodcastPreview');
jest.mock('./../../fetching/getFeedData');

beforeEach(async () => {
  await seedDatabase();
  jest.resetAllMocks();
});

describe('create podcast with feed', () => {
  it('throws an error if itunesId was not provided', async () => {
    await expect(createPodcastWithFeed()).rejects.toThrowError();
  });

  it('throws an error if podcast with provided itunesId already exists', async () => {
    await expect(
      createPodcastWithFeed(podcastOne.data.itunesId)
    ).rejects.toThrowError();
  });

  it('creates new podcast with episodes', async () => {
    getPodcastPreview.mockResolvedValue(prettifiedResult);
    getFeedData.mockResolvedValue(rawData);

    const result = await createPodcastWithFeed(prettifiedResult.itunesId);

    const exists = await db.exists.Podcast({ itunesId: result.itunesId });
    const episodes = await db.query.episodes({
      where: {
        podcast: {
          itunesId: prettifiedResult.itunesId,
        },
      },
    });

    expect(exists).toBe(true);
    expect(episodes.length).toBe(3);
  });
});
