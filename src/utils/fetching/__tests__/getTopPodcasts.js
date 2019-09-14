import getTopPodcasts from '../getTopPodcasts';
import fetchTopPodcasts from '../fetchTopPodcasts';

import { entryData, ids } from '../../seeds/topPodcasts';

jest.mock('./../fetchTopPodcasts');

describe('getTopPodcasts', () => {
  it('calls fetchTopPodcasts and returns prettified data', async () => {
    // setup
    fetchTopPodcasts.mockResolvedValue(entryData);

    // work
    const topPodcastsIds = await getTopPodcasts({ categoryId: 1321 });

    // expect
    expect(topPodcastsIds).toEqual(ids);
    expect(fetchTopPodcasts).toHaveBeenCalledTimes(1);
  });
});
