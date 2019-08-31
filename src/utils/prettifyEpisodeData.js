import { pick, get } from 'lodash';

function filterEnclosures(enclosures) {
  const array = Array.isArray(enclosures) ? enclosures : [enclosures];

  return array.find(
    el =>
      [
        'audio/mpeg',
        'audio/mpeg3',
        'audio/mp4',
        'audio/x-mpeg',
        'audio/x-m4a',
      ].indexOf(el.type) !== -1
  );
}

function toSeconds(time) {
  const p = time.split(':');
  let s = 0;
  let m = 1;

  while (p.length > 0) {
    s += m * parseInt(p.pop(), 10);
    m *= 60;
  }

  return s;
}

function parseDuration(duration) {
  return duration.indexOf(':') === -1
    ? parseInt(duration)
    : toSeconds(duration);
}

const prettifyEpisodeData = episodeData => {
  const duration = get(episodeData, ['itunes:duration']);
  const enclosure = filterEnclosures(get(episodeData, 'enclosures'));

  const data = {
    ...pick(episodeData, ['title', 'description', 'pubDate', 'link']),
    mediaUrl: enclosure && enclosure.url,
    duration: duration ? parseDuration(duration['#']) : 0,
  };

  return data;
};

export default prettifyEpisodeData;
