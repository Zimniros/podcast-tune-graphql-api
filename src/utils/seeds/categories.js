const prettifiedCategories = [
  { name: 'Technology', itunesId: 1318 },
  { name: 'Arts', itunesId: 1301 },
  { name: 'Education', itunesId: 1304 },
  { name: 'Design', itunesId: 1402 },
  { name: 'News', itunesId: 1489 },
  { name: 'Tech News', itunesId: 1528 },
];

const rawCategories = {
  '1318': {
    name: 'Technology',
    id: '1318',
    subgenres: {
      '1489': {
        name: 'News',
        id: '1489',
      },
      '1528': {
        name: 'Tech News',
        id: '1528',
      },
      '1301': {
        name: 'Arts',
        id: '1301',
      },
      '1402': {
        name: 'Design',
        id: '1402',
      },
      '1304': {
        name: 'Education',
        id: '1304',
      },
    },
  },
};

const rawData = {
  '26': {
    subgenres: rawCategories,
  },
};

export { rawData, rawCategories, prettifiedCategories };
