import axios from 'axios';
import prettifyPreviewData from './prettifyPreviewData';

const fetchSearchResults = async (searchTerm = '', limit = 20) =>
  new Promise(async (resolve, reject) => {
    let jsonData;
    try {
      jsonData = await axios.get(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          searchTerm
        )}&entity=podcast&limit=${limit}`
      );
    } catch (error) {
      return reject(error);
    }

    const { resultCount, results } = jsonData.data;

    if (resultCount === 0) {
      return resolve([]);
    }

    const data = results.map(preview => prettifyPreviewData(preview));
    return resolve(data);
  });

export default fetchSearchResults;
