import getPodcastPreview from '../getPodcastPreview';
import fetchPodcastPreview from '../fetchPodcastPreview';

import { rawPreview, prettifiedPreview } from '../../seeds/podcastOne';

jest.mock('./../fetchPodcastPreview');

describe('getPodcastPreview', () => {
  it('calls fetchPodcastPreview and returns prettified data', async () => {
    // setup
    fetchPodcastPreview.mockResolvedValue(rawPreview);

    // work
    const podcastPreview = await getPodcastPreview(1253186678);

    // expect
    expect(podcastPreview).toEqual(prettifiedPreview);
    expect(fetchPodcastPreview).toHaveBeenCalledTimes(1);
  });
});
