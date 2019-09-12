import axios from 'axios';

const getFeedStream = async url => {
  if (!url || url.trim().length === 0)
    throw new Error('A podcast feedUrl was not provided.');

  const feedStream = await axios({
    method: 'get',
    url,
    responseType: 'stream',
    timeout: 30000,
  });

  return feedStream;
};

export { getFeedStream as default };
