import axios from 'axios';

const getFeedStream = async url => {
  const feedStream = await axios({
    method: 'get',
    url,
    responseType: 'stream',
    timeout: 30000,
  });

  return feedStream;
};

export { getFeedStream as default };
