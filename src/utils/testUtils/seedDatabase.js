import bcrypt from 'bcryptjs';
import * as faker from 'faker';
import db from '../../db';
import generateToken from '../auth/generateToken';

const userOne = {
  data: {
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync(faker.internet.password(), 10),
    name: faker.name.firstName(),
  },
  user: undefined,
  jwt: undefined,
};

const userTwo = {
  data: {
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync(faker.internet.password(), 10),
    name: faker.name.firstName(),
  },
  user: undefined,
  jwt: undefined,
};

const seedDatabase = async () => {
  await db.mutation.deleteManyUsers();

  // Create user one
  userOne.user = await db.mutation.createUser({
    data: userOne.data,
  });
  userOne.jwt = generateToken(userOne.user.id);

  // Create user two
  userTwo.user = await db.mutation.createUser({
    data: userTwo.data,
  });
  userTwo.jwt = generateToken(userTwo.user.id);
};
export default seedDatabase;
export { userOne, userTwo };
