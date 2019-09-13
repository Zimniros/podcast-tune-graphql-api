import axios from 'axios';

const categoriesItunesUrl =
  'https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/genres?id=26';

const getCategories = async () => {
  const response = await axios.get(categoriesItunesUrl);

  return response.data[26].subgenres;
};

export { getCategories as default, categoriesItunesUrl };
