import axios from 'axios';

const constructUrl = ({ categoryId, limit, country }) =>
  `https://itunes.apple.com/${country}/rss/topaudiopodcasts/limit=${limit}/genre=${categoryId}/json`;

const fetchTopPodcasts = async ({
  categoryId,
  limit = 200,
  country = 'US',
}) => {
  if (Number.isNaN(parseInt(categoryId)))
    throw new Error('  A categoryId was not provided.');

  if (parseInt(limit) > 200)
    throw new Error('  A limit cannot be bigger than 200.');

  console.time(`  Top podcasts for ${categoryId} fetched in`);
  const url = constructUrl({ categoryId, limit, country });

  const jsonData = await axios.get(url);
  const result = jsonData.data.feed.entry;

  console.timeEnd(`  Top podcasts for ${categoryId} fetched in`);
  return result;
};

export { fetchTopPodcasts as default, constructUrl };
