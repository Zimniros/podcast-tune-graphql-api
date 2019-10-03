import bcrypt from 'bcryptjs';
import * as faker from 'faker';
import db from '../../db';

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

const seedDatabase = async () => {
  await db.mutation.deleteManyUsers();

  // Create user one
  userOne.user = await db.mutation.createUser({
    data: userOne.data,
  });

  // Create user two
  userTwo.user = await db.mutation.createUser({
    data: userTwo.data,
  });
};
export default seedDatabase;
export { userOne, userTwo };
