import { pick, get } from 'lodash';
import { JSDOM } from 'jsdom';

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
    const current = p.pop();

    if (isNaN(current) || current.trim().length === 0) break;
    s += m * parseInt(current, 10);
    m *= 60;
  }

  return s;
}

function parseDuration(duration) {
  if (duration.trim().length === 0) return 0;

  if (duration.indexOf(':') !== -1) return toSeconds(duration);

  return isNaN(duration) ? 0 : parseInt(duration);
}

function sanitizeDescription(description) {
  const dom = new JSDOM(description);
  return dom.window.document.body.textContent || '';
}

const prettifyEpisodeData = episodeData => {
  const duration = get(episodeData, ['itunes:duration']);

  const enclosure = filterEnclosures(get(episodeData, 'enclosures'));
  const episodeArtwork = get(episodeData, ['itunes:image']);

  const description = get(episodeData, 'description');
  const descriptionSanitized = sanitizeDescription(description);

  const data = {
    ...pick(episodeData, ['title', 'pubDate', 'link']),
    description,
    descriptionSanitized,
    mediaUrl: enclosure && enclosure.url,
    duration: duration && parseDuration(duration['#']),
    episodeArtwork: episodeArtwork ? episodeArtwork['@'].href : null,
  };

  return data;
};

export default prettifyEpisodeData;
