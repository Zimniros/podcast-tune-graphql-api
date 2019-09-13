import axios from 'axios';
import stream from 'stream';
import fetchFeedStream, { streamConfig } from '../fetchFeedStream';

// https://stackoverflow.com/questions/52275312/how-to-mock-axios-as-default-export-with-jest/52277528#52277528
jest.mock('axios');

describe('fetchFeedStream', () => {
  it('calls axios and returns data stream', async () => {
    const mockedStream = new stream.Readable();
    axios.mockResolvedValue({ data: mockedStream });

    const url = 'https://feed.syntax.fm/rss';

    const feedStream = await fetchFeedStream(url);

    expect(feedStream.data).toEqual(mockedStream);
    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toBeCalledWith({ url, ...streamConfig });
  });
});
