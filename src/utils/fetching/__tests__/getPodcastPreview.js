import getPodcastPreview from '../getPodcastPreview';
import fetchPodcastPreview from '../fetchPodcastPreview';

import { rawResults, prettifiedResult } from '../../seeds/podcastPreview';

jest.mock('./../fetchPodcastPreview');

describe('getPodcastPreview', () => {
  it('calls fetchPodcastPreview and returns prettified data', async () => {
    // setup
    fetchPodcastPreview.mockResolvedValue(rawResults);

    // work
    const podcastPreview = await getPodcastPreview(1253186678);

    // expect
    expect(podcastPreview).toEqual(prettifiedResult);
    expect(fetchPodcastPreview).toHaveBeenCalledTimes(1);
  });
});
