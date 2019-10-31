import axios from 'axios';
import fetchPodcastPreview from '../fetchPodcastPreview';

import { rawBulkResults } from '../../seeds/podcastPreview';

import { rawLookup, emptyLookup, rawPreview } from '../../seeds/podcastOne';

jest.mock('axios');

describe('fetchPodcastPreview', () => {
  it('fetches data from iTunes', async () => {
    // setup
    axios.get.mockResolvedValue({
      data: rawLookup,
    });

    // work
    const data = await fetchPodcastPreview(rawPreview.collectionId);

    // expect
    expect(data).toEqual(rawPreview);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('throws an error if empty results', async () => {
    // setup
    axios.get.mockResolvedValue({
      data: emptyLookup,
    });

    // work
    await expect(
      fetchPodcastPreview(rawPreview.collectionId)
    ).rejects.toThrowError();
  });

  it("throws an error if results don't contain data with provided itunesId", async () => {
    // setup
    axios.get.mockResolvedValue({
      data: rawBulkResults,
    });

    // work
    await expect(
      fetchPodcastPreview(rawPreview.collectionId)
    ).rejects.toThrowError();
  });
});
