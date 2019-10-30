import createPodcast from '../createPodcast';
import seedDatabase, { podcastOne } from '../../testUtils/seedDatabase';
import db from '../../../db';

import getPodcastPreview from '../../fetching/getPodcastPreview';
import getFeedMeta from '../../fetching/getFeedMeta';

import { prettifiedResult } from '../../seeds/podcastPreview';
import { rawMeta } from '../../seeds/feedData';

jest.mock('./../../fetching/getPodcastPreview');
jest.mock('./../../fetching/getFeedMeta');

beforeEach(async () => {
  await seedDatabase();
  jest.resetAllMocks();
});

describe('create podcast', () => {
  it('throws an error if itunesId was not provided', async () => {
    await expect(createPodcast()).rejects.toThrowError();
  });

  it('throws an error if podcast with provided itunesId already exists', async () => {
    await expect(
      createPodcast(podcastOne.data.itunesId)
    ).rejects.toThrowError();
  });

  it('creates new podcasts', async () => {
    getPodcastPreview.mockResolvedValue(prettifiedResult);
    getFeedMeta.mockResolvedValue(rawMeta);

    const result = await createPodcast(1253186678);

    const exists = await db.exists.Podcast({ itunesId: result.itunesId });

    expect(exists).toBe(true);
  });
});
