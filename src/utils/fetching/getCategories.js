import { values, pick } from 'lodash';

import fetchCategories from './fetchCategories';

const prettifyData = (arr, properties = ['name', 'id', 'subgenres']) =>
  values(arr).map(el => pick(el, properties));

const getCategories = async () => {
  const rawCategories = await fetchCategories();

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

export { getCategories as default };
