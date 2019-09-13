const prettifiedCategories = [
  { name: 'Business', itunesId: 1321 },
  { name: 'Careers', itunesId: 1410 },
  { name: 'Investing', itunesId: 1412 },
  { name: 'Management', itunesId: 1491 },
  { name: 'Marketing', itunesId: 1492 },
  { name: 'Entrepreneurship', itunesId: 1493 },
  { name: 'Non-Profit', itunesId: 1494 },
];

const rawCategories = {
  '1321': {
    name: 'Business',
    id: '1321',
    subgenres: {
      '1410': {
        name: 'Careers',
        id: '1410',
      },
      '1493': {
        name: 'Entrepreneurship',
        id: '1493',
      },
      '1412': {
        name: 'Investing',
        id: '1412',
      },
      '1491': {
        name: 'Management',
        id: '1491',
      },
      '1492': {
        name: 'Marketing',
        id: '1492',
      },
      '1494': {
        name: 'Non-Profit',
        id: '1494',
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
