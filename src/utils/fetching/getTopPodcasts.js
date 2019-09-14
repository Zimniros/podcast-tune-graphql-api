import fetchTopPodcasts from './fetchTopPodcasts';

function getItunesId(data) {
  return +data.id.attributes['im:id'];
}

function prettifyData(data) {
  if (Array.isArray(data)) {
    return data.map(el => getItunesId(el));
  }

  if (typeof data === 'object') {
    return getItunesId(data);
  }
}

const getTopPodcasts = async config => {
  const data = await fetchTopPodcasts(config);

  return prettifyData(data);
};

export default getTopPodcasts;
