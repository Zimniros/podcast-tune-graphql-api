import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';
import * as faker from 'faker';
import getClient from '../../../utils/testUtils/getClient';
import db from '../../../db';
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  invalidLogin,
  passwordNotLongEnough,
} from '../../../utils/auth/messages';
import seedDatabase, { userOne } from '../../../utils/testUtils/seedDatabase';

const email = faker.internet.email();
const password = faker.internet.password();
const name = faker.name.firstName();

const client = getClient();

const REGISTER_MUTATION = gql`
  mutation REGISTER_MUTATION(
    $email: String!
    $password: String!
    $name: String
  ) {
    register(email: $email, password: $password, name: $name) {
      errors {
        path
        message
      }

      token
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LOGIN_MUTATION($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      errors {
        path
        message
      }

      token
    }
  }
`;

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      permissions
    }
  }
`;

beforeEach(async () => {
  await seedDatabase();
});

describe('auth mutations', () => {
  describe('Register user', () => {
    it('should create a new user', async () => {
      const variables = {
        name,
        email,
        password,
      };

      const result = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables,
      });

      const {
        data: { register },
      } = result;
      const { errors, token } = register;

      const exists = await db.exists.User({ email: email.toLowerCase() });

      expect(errors).toBeNull();
      expect(token).not.toBeNull();
      expect(exists).toBe(true);
    });

    it('checks for duplicate emails', async () => {
      const result = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          email: userOne.data.email,
          password,
        },
      });

      const {
        data: { register },
      } = result;
      const { errors, token } = register;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          __typename: 'Error',
          path: 'email',
          message: duplicateEmail,
        },
      ]);
    });

    it('checks for bad email', async () => {
      const result = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          email: 'b',
          password,
        },
      });

      const {
        data: { register },
      } = result;
      const { errors, token } = register;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          __typename: 'Error',
          path: 'email',
          message: emailNotLongEnough,
        },
        {
          __typename: 'Error',
          path: 'email',
          message: invalidEmail,
        },
      ]);
    });

    it('checks for bad password', async () => {
      const result = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          email: faker.internet.email(),
          password: 'b',
        },
      });

      const {
        data: { register },
      } = result;
      const { errors, token } = register;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          __typename: 'Error',
          path: 'password',
          message: passwordNotLongEnough,
        },
      ]);
    });

    it('checks for bad password and bad email', async () => {
      const result = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          email: 'd',
          password: 'b',
        },
      });

      const {
        data: { register },
      } = result;
      const { errors, token } = register;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          __typename: 'Error',
          path: 'email',
          message: emailNotLongEnough,
        },
        {
          __typename: 'Error',
          path: 'email',
          message: invalidEmail,
        },
        {
          __typename: 'Error',
          path: 'password',
          message: passwordNotLongEnough,
        },
      ]);
    });
  });

  describe('Login user', () => {
    it('should not login with bad password', async () => {
      const variables = {
        email: userOne.data.email,
        password: faker.internet.password(),
      };

      const result = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables,
      });

      const {
        data: { login },
      } = result;
      const { errors, token } = login;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          __typename: 'Error',
          path: 'email',
          message: invalidLogin,
        },
      ]);
    });

    it('should not login with non existing email', async () => {
      const result = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          email: faker.internet.email(),
          password: faker.internet.password(),
        },
      });

      const {
        data: { login },
      } = result;
      const { errors, token } = login;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          __typename: 'Error',
          path: 'email',
          message: invalidLogin,
        },
      ]);
    });
  });

  // it('register user with correct ', async () => {
  // const client = getClient(
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjazBwZ2d1OGswMDIxMDcxN29seGJ0cTVyIiwiaWF0IjoxNTY4ODIyNTk1fQ.ipGtPd3GhuLlwHaCY08SKVaji57q6rOQT5QwYOXfW8Y'
  // );

  // const variables = {
  //   name: 'John',
  //   email: 'andasczddasrewczx@examdsadcxzczasdasple.com',
  //   password: 'MyPass123',
  // };

  // console.log(result.data.register.id);
  // console.log('generateToken', generateToken(result.data.register.id));

  // const result2 = await client.query({ query: CURRENT_USER_QUERY });
  // console.log(result2);
});
