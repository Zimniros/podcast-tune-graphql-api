import axios from 'axios';
import { values, pick } from 'lodash';

const prettifyData = (arr, properties = ['name', 'id', 'subgenres']) =>
  values(arr).map(el => pick(el, properties));

const fetchCategories = async () =>
  new Promise(async (resolve, reject) => {
    let response;
    try {
      response = await axios.get(
        'https://itunes.apple.com/WebObjects/MZStoreServices.woa/ws/genres?id=26'
      );
    } catch (error) {
      return reject(error);
    }

    const rawCategories = response.data[26].subgenres;
    const categoriesData = prettifyData(rawCategories).map(el => {
      el.subgenres = prettifyData(el.subgenres, ['name', 'id']);
      return el;
    });

    const categories = categoriesData.reduce((acc, category) => {
      const { name, id, subgenres } = category;
      acc.push(Object.assign({}, { name, itunesId: +id }));

      if (subgenres && subgenres.length && subgenres.length > 0) {
        subgenres.map(el =>
          acc.push(Object.assign({}, { name: el.name, itunesId: +el.id }))
        );
      }

      return acc;
    }, []);

    return resolve(categories);
  });

export { fetchCategories as default };
