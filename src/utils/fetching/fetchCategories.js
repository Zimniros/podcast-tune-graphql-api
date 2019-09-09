import axios from 'axios';
import { values, pick } from 'lodash';

const prettifyData = (arr, properties = ['name', 'id', 'subgenres']) =>
  values(arr).map(el => pick(el, properties));

const fetchCategories = async () => {
  let response;
  try {
    response = await axios.get(
      'https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/genres?id=26'
    );
  } catch (error) {
    throw new Error(error.message);
  }

  const rawCategories = response.data[26].subgenres;
  const categoriesData = prettifyData(rawCategories).map(el => {
    el.subgenres = prettifyData(el.subgenres, ['name', 'id']);
    return el;
  });

  const categories = categoriesData.reduce((acc, category) => {
    const { name, id, subgenres } = category;
    acc.push({ name, itunesId: +id });

    if (subgenres && subgenres.length && subgenres.length > 0) {
      subgenres.map(el => acc.push({ name: el.name, itunesId: +el.id }));
    }

    return acc;
  }, []);

  return categories;
};

export { fetchCategories as default };
