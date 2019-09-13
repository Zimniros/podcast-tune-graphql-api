import stream from 'stream';
import getFeedMeta from '../getFeedMeta';
import fetchFeedStream from '../fetchFeedStream';
import { threeCorrectEpisodes } from '../../seeds/streamData';

jest.mock('./../fetchFeedStream');

const getMockedStream = data => {
  const mockedStream = new stream.Readable();
  mockedStream.push(data);
  mockedStream.push(null);
  return mockedStream;
};

const url = 'https://feed.syntax.fm/rss';

describe('getFeedMeta', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls fetchFeedStream and returns correct data', async () => {
    // setup
    fetchFeedStream.mockResolvedValue({
      data: getMockedStream(threeCorrectEpisodes),
    });

    // work
    const meta = await getFeedMeta(url);

    // expect
    expect(meta).not.toBeNull();
    expect(fetchFeedStream).toHaveBeenCalledTimes(1);
    expect(fetchFeedStream).toHaveBeenCalledWith(url);
  });
});
