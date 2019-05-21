import { pick, get } from 'lodash';

function filterEnclosures(enclosures) {
  const array = Array.isArray(enclosures) ? enclosures : [enclosures];

  return array.find(el => ['audio/mpeg', 'audio/mp4'].indexOf(el.type !== -1));
}

function parseDuration(duration) {
  const dur = parseInt(duration);
  return Number.isNaN(dur) ? undefined : dur;
}

const prettifyEpisodeData = episodeData => {
  const enclosure = filterEnclosures(get(episodeData, 'enclosures'));

  const mediaData = {
    mediaUrl: enclosure && enclosure.url,
    duration: enclosure && parseDuration(enclosure.length),
    durationVerified: !enclosure && true,
  };

  const data = {
    ...pick(episodeData, ['title', 'description', 'pubDate', 'link']),
    ...mediaData,
  };

  return data;
};

export default prettifyEpisodeData;
