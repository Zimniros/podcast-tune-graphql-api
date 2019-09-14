import axios from 'axios';
import fetchTopPodcasts, { constructUrl } from '../fetchTopPodcasts';

import { rawData, entryData } from '../../seeds/topPodcasts';

jest.mock('axios');

describe('fetchTopPodcasts', () => {
  it('fetches data from iTunes', async () => {
    // setup
    axios.get.mockResolvedValue({
      data: rawData,
    });

    const config = {
      categoryId: 1321,
      limit: 100,
      country: 'RU',
    };

    const calledUrl = constructUrl(config);

    // work
    const data = await fetchTopPodcasts(config);

    // expect
    expect(data).toEqual(entryData);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(calledUrl);
  });

  it('throws an error if categoryId is not provided', () => {
    expect(fetchTopPodcasts()).rejects.toThrowError();
  });

  it('throws an error if limit value > 200', () => {
    const config = {
      categoryId: 1321,
      limit: 201,
      country: 'RU',
    };

    expect(fetchTopPodcasts(config)).rejects.toThrowError();
  });
});
