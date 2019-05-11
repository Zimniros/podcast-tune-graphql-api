import axios from 'axios';
import { values, pick } from 'lodash';

const prettifyData = (arr, properties = ['name', 'id', 'subgenres']) =>
  values(arr).map(el => pick(el, properties));

const fetchCategories = async () => {
  const res = await axios.get(
    'https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/genres?id=26'
  );

  const rawCategories = res.data[26].subgenres;
  const categoriesData = prettifyData(rawCategories).map(el => {
    el.subgenres = prettifyData(el.subgenres, ['name', 'id']);
    return el;
  });

  return categoriesData.reduce((acc, category) => {
    const { name, id, subgenres } = category;
    acc.push(Object.assign({}, { name, itunesId: +id }));

    if (subgenres && subgenres.length && subgenres.length > 0) {
      subgenres.map(el =>
        acc.push(Object.assign({}, { name: el.name, itunesId: +el.id }))
      );
    }

    return acc;
  }, []);
};

export { fetchCategories as default };
