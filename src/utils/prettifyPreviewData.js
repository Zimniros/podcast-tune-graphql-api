function prettifyPreviewData(data) {
  return {
    itunesId: data.collectionId,
    title: data.trackName,
    author: data.artistName,
    feedUrl: data.feedUrl,
    itunesUrl: data.collectionViewUrl,
    artworkSmall: data.artworkUrl100,
    artworkLarge: data.artworkUrl600,
    categoryIds: data.genreIds
      .filter(id => id !== '26')
      .map(id => ({ itunesId: +id })),
  };
}

export default prettifyPreviewData;
