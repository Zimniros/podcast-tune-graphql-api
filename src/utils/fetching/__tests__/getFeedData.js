import stream from 'stream';
import getFeedData from '../getFeedData';
import fetchFeedStream from '../fetchFeedStream';
import {
  threeCorrectEpisodes,
  threeWithOneEpisodeWithoutTitle,
  threeWthOneEpisodeWithoutMediaUrl,
} from '../../seeds/streamData';

jest.mock('./../fetchFeedStream');

const getMockedStream = data => {
  const mockedStream = new stream.Readable();
  mockedStream.push(data);
  mockedStream.push(null);
  return mockedStream;
};

const url = 'https://feed.syntax.fm/rss';

describe('getFeedDara', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls fetchCategories and returns correct data', async () => {
    // setup
    fetchFeedStream.mockResolvedValue({
      data: getMockedStream(threeCorrectEpisodes),
    });

    // work
    const feed = await getFeedData(url);

    // expect
    expect(feed.meta).not.toBeNull();
    expect(feed.episodes.length).toEqual(3);
    expect(fetchFeedStream).toHaveBeenCalledTimes(1);
    expect(fetchFeedStream).toHaveBeenCalledWith(url);
  });

  it('skips episode without title', async () => {
    // setup
    fetchFeedStream.mockResolvedValue({
      data: getMockedStream(threeWithOneEpisodeWithoutTitle),
    });

    // work
    const feed = await getFeedData(url);

    // expect
    expect(feed.meta).not.toBeNull();
    expect(feed.episodes.length).toEqual(2);
    expect(fetchFeedStream).toHaveBeenCalledTimes(1);
    expect(fetchFeedStream).toHaveBeenCalledWith(url);
  });

  it('skips episode without mediaUrl', async () => {
    // setup
    fetchFeedStream.mockResolvedValue({
      data: getMockedStream(threeWthOneEpisodeWithoutMediaUrl),
    });

    // work
    const feed = await getFeedData(url);

    // expect
    expect(feed.meta).not.toBeNull();
    expect(feed.episodes.length).toEqual(2);
    expect(fetchFeedStream).toHaveBeenCalledTimes(1);
    expect(fetchFeedStream).toHaveBeenCalledWith(url);
  });
});
