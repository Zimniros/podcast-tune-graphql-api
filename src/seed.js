import db from './db';
import fetchCategories from './utils/fetching/fetchCategories';

const main = async () => {
  const categories = await fetchCategories();

  const promises = [];

  categories.forEach(category => {
    const mutationPromise = db.mutation.createCategory({
      data: {
        ...category,
      },
    });
    promises.push(mutationPromise);
  });

  return Promise.all(promises);
};

main();
