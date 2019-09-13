import axios from 'axios';

const streamConfig = {
  method: 'get',
  responseType: 'stream',
  timeout: 30000,
};

const getFeedStream = async url => {
  const feedStream = await axios({
    url,
    ...streamConfig,
  });

  return feedStream;
};

export { getFeedStream as default, streamConfig };
