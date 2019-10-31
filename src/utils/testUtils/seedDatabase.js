import bcrypt from 'bcryptjs';
import * as faker from 'faker';
import db from '../../db';

import { prettifiedCategories } from '../seeds/categories';
import { prettifiedPreview } from '../seeds/podcastOne';

const passwordOne = faker.internet.password();

const userOne = {
  data: {
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync(passwordOne, 10),
    name: faker.name.firstName(),
  },
  rawPassword: passwordOne,
  user: undefined,
};

const passwordTwo = faker.internet.password();

const userTwo = {
  data: {
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync(passwordTwo, 10),
    name: faker.name.firstName(),
  },

  rawPassword: passwordTwo,
  user: undefined,
};

const podcastOne = {
  data: prettifiedPreview,
  podcast: undefined,
};

const categoryOne = {
  data: prettifiedCategories[0],
  category: undefined,
};

const categoryTwo = {
  data: prettifiedCategories[1],
  category: undefined,
};

const categoryThree = {
  data: prettifiedCategories[2],
  category: undefined,
};

const categoryFour = {
  data: prettifiedCategories[3],
  category: undefined,
};

const categoryFive = {
  data: prettifiedCategories[4],
  category: undefined,
};

const categorySix = {
  data: prettifiedCategories[5],
  category: undefined,
};

const seedDatabase = async () => {
  await db.mutation.deleteManyUsers();
  await db.mutation.deleteManyEpisodes();
  await db.mutation.deleteManyPodcasts();
  await db.mutation.deleteManyCategories();

  // Create user one
  userOne.user = await db.mutation.createUser({
    data: userOne.data,
  });

  // Create user two
  userTwo.user = await db.mutation.createUser({
    data: userTwo.data,
  });

  categoryOne.category = await db.mutation.createCategory({
    data: categoryOne.data,
  });

  categoryTwo.category = await db.mutation.createCategory({
    data: categoryTwo.data,
  });

  categoryThree.category = await db.mutation.createCategory({
    data: categoryThree.data,
  });

  categoryFour.category = await db.mutation.createCategory({
    data: categoryFour.data,
  });

  categoryFive.category = await db.mutation.createCategory({
    data: categoryFive.data,
  });

  categorySix.category = await db.mutation.createCategory({
    data: categorySix.data,
  });

  podcastOne.podcast = await db.mutation.createPodcast({
    data: podcastOne.data,
  });
};
export default seedDatabase;
export { userOne, userTwo, podcastOne };
