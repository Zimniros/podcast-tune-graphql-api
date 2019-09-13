import axios from 'axios';

const streamConfig = {
  method: 'get',
  responseType: 'stream',
  timeout: 30000,
};

const fetchFeedStream = async url => {
  const feedStream = await axios({
    url,
    ...streamConfig,
  });

  return feedStream;
};

export { fetchFeedStream as default, streamConfig };
