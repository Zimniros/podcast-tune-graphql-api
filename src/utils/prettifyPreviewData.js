function prettifyPreviewData(data) {
  return {
    itunesId: data.collectionId,
    title: data.trackName,
    titleLC: data.trackName.toLowerCase(),
    author: data.artistName,
    authorLC: data.artistName.toLowerCase(),
    feedUrl: data.feedUrl,
    itunesUrl: data.collectionViewUrl,
    artworkSmall: data.artworkUrl100,
    artworkLarge: data.artworkUrl600,
    categories: {
      connect: data.genreIds
        .filter(id => id !== '26')
        .map(id => ({ itunesId: +id })),
    },
  };
}

export default prettifyPreviewData;
