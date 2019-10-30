const prettifiedResult = {
  artworkLarge:
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/9f/af/3f/9faf3fc9-98b8-4763-382e-dcccea5fa5c9/mza_3415071783848980264.png/600x600bb.jpg',
  artworkSmall:
    'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/9f/af/3f/9faf3fc9-98b8-4763-382e-dcccea5fa5c9/mza_3415071783848980264.png/100x100bb.jpg',
  author: 'Wes Bos & Scott Tolinski - Full Stack JavaScript Web Developers',
  authorLC: 'wes bos & scott tolinski - full stack javascript web developers',
  categoryIds: [{ itunesId: 1318 }, { itunesId: 1489 }, { itunesId: 1528 }],
  feedUrl: 'https://feed.syntax.fm/rss',
  itunesId: 1253186678,
  itunesUrl:
    'https://podcasts.apple.com/us/podcast/syntax-tasty-web-development-treats/id1253186678?uo=4',
  title: 'Syntax - Tasty Web Development Treats',
  titleLC: 'syntax - tasty web development treats',
};

const rawResults = [
  {
    wrapperType: 'track',
    kind: 'podcast',
    collectionId: 1253186678,
    trackId: 1253186678,
    artistName:
      'Wes Bos & Scott Tolinski - Full Stack JavaScript Web Developers',
    collectionName: 'Syntax - Tasty Web Development Treats',
    trackName: 'Syntax - Tasty Web Development Treats',
    collectionCensoredName: 'Syntax - Tasty Web Development Treats',
    trackCensoredName: 'Syntax - Tasty Web Development Treats',
    collectionViewUrl:
      'https://podcasts.apple.com/us/podcast/syntax-tasty-web-development-treats/id1253186678?uo=4',
    feedUrl: 'https://feed.syntax.fm/rss',
    trackViewUrl:
      'https://podcasts.apple.com/us/podcast/syntax-tasty-web-development-treats/id1253186678?uo=4',
    artworkUrl30:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/9f/af/3f/9faf3fc9-98b8-4763-382e-dcccea5fa5c9/mza_3415071783848980264.png/30x30bb.jpg',
    artworkUrl60:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/9f/af/3f/9faf3fc9-98b8-4763-382e-dcccea5fa5c9/mza_3415071783848980264.png/60x60bb.jpg',
    artworkUrl100:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/9f/af/3f/9faf3fc9-98b8-4763-382e-dcccea5fa5c9/mza_3415071783848980264.png/100x100bb.jpg',
    collectionPrice: 0.0,
    trackPrice: 0.0,
    trackRentalPrice: 0,
    collectionHdPrice: 0,
    trackHdPrice: 0,
    trackHdRentalPrice: 0,
    releaseDate: '2019-10-28T13:00:00Z',
    collectionExplicitness: 'cleaned',
    trackExplicitness: 'cleaned',
    trackCount: 192,
    country: 'USA',
    currency: 'USD',
    primaryGenreName: 'Technology',
    contentAdvisoryRating: 'Clean',
    artworkUrl600:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/9f/af/3f/9faf3fc9-98b8-4763-382e-dcccea5fa5c9/mza_3415071783848980264.png/600x600bb.jpg',
    genreIds: ['1318', '26', '1489', '1528'],
    genres: ['Technology', 'Podcasts', 'News', 'Tech News'],
  },
];

const rawData = {
  resultCount: 1,
  results: rawResults,
};

const emptyData = {
  resultCount: 0,
  results: [],
};

export { rawData, rawResults, prettifiedResult, emptyData };
