import axios from 'axios';
import fetchPodcastPreview from '../fetchPodcastPreview';

import {
  rawData,
  rawResult,
  emptyData,
  rawBulkResults,
} from '../../seeds/podcastPreview';

jest.mock('axios');

describe('fetchPodcastPreview', () => {
  it('fetches data from iTunes', async () => {
    // setup
    axios.get.mockResolvedValue({
      data: rawData,
    });

    // work
    const data = await fetchPodcastPreview(1253186678);

    // expect
    expect(data).toEqual(rawResult);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it('throws an error if empty results', async () => {
    // setup
    axios.get.mockResolvedValue({
      data: emptyData,
    });

    // work
    await expect(fetchPodcastPreview(1253186678)).rejects.toThrowError();
  });

  it("throws an error if results don't contain data with provided itunesId", async () => {
    // setup
    axios.get.mockResolvedValue({
      data: rawBulkResults,
    });

    // work
    await expect(fetchPodcastPreview(1253186678)).rejects.toThrowError();
  });
});
