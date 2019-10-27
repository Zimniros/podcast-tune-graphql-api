import gql from 'graphql-tag';
import * as faker from 'faker';
import redis from '../../../redis';
import getClient from '../../../utils/testUtils/getClient';
import db from '../../../db';
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  invalidLogin,
  passwordNotLongEnough,
  requestSuccessful,
  invalidToken,
  resetSuccessful,
  confirmPasswordMismatch,
} from '../../../utils/auth/messages';
import seedDatabase, {
  userOne,
  userTwo,
} from '../../../utils/testUtils/seedDatabase';
import { createForgotPasswordLink } from '../../../utils/auth/createForgotPasswordLink';

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

const LOGOUT_MUTATION = gql`
  mutation LOGOUT_MUTATION {
    logout
  }
`;

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!) {
    requestReset(email: $email) {
      errors {
        path
        message
      }

      message
    }
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation RESET_PASSWORD_MUTATION(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      errors {
        path
        message
      }

      message
    }
  }
`;

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
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

      const result = await client.request(REGISTER_MUTATION, variables);
      const { register } = result;
      const { errors, token } = register;

      const exists = await db.exists.User({ email: email.toLowerCase() });

      expect(errors).toBeNull();
      expect(token).not.toBeNull();
      expect(exists).toBe(true);
    });

    it('checks for duplicate emails', async () => {
      const result = await client.request(REGISTER_MUTATION, {
        email: userOne.data.email,
        password,
      });

      const { register } = result;
      const { errors, token } = register;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          path: 'email',
          message: duplicateEmail,
        },
      ]);
    });

    it('checks for bad email', async () => {
      const result = await client.request(REGISTER_MUTATION, {
        email: 'b',
        password,
      });

      const { register } = result;
      const { errors, token } = register;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          path: 'email',
          message: emailNotLongEnough,
        },
        {
          path: 'email',
          message: invalidEmail,
        },
      ]);
    });

    it('checks for bad password', async () => {
      const result = await client.request(REGISTER_MUTATION, {
        email: faker.internet.email(),
        password: 'b',
      });

      const { register } = result;
      const { errors, token } = register;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          path: 'password',
          message: passwordNotLongEnough,
        },
      ]);
    });

    it('checks for bad password and bad email', async () => {
      const result = await client.request(REGISTER_MUTATION, {
        email: 'd',
        password: 'b',
      });

      const { register } = result;
      const { errors, token } = register;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          path: 'email',
          message: emailNotLongEnough,
        },
        {
          path: 'email',
          message: invalidEmail,
        },
        {
          path: 'password',
          message: passwordNotLongEnough,
        },
      ]);
    });
  });

  describe('Login user', () => {
    it('should login with correct credentials', async () => {
      const variables = {
        email: userOne.data.email,
        password: userOne.rawPassword,
      };

      const result = await client.request(LOGIN_MUTATION, variables);

      const { login } = result;
      const { errors, token } = login;

      expect(errors).toBeNull();
      expect(token).not.toBeNull();
    });

    it('should not login with bad password', async () => {
      const variables = {
        email: userOne.data.email,
        password: faker.internet.password(),
      };

      const result = await client.request(LOGIN_MUTATION, variables);

      const { login } = result;
      const { errors, token } = login;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          path: 'email',
          message: invalidLogin,
        },
      ]);
    });

    it('should not login with non existing email', async () => {
      const result = await client.request(LOGIN_MUTATION, {
        email: faker.internet.email(),
        password: faker.internet.password(),
      });

      const { login } = result;
      const { errors, token } = login;

      expect(token).toBeNull();
      expect(errors).toEqual([
        {
          path: 'email',
          message: invalidLogin,
        },
      ]);
    });
  });

  describe('Logout user', () => {
    it('should logout user', async () => {
      const variables = {
        email: userOne.data.email,
        password: userOne.rawPassword,
      };

      await client.request(LOGIN_MUTATION, variables);
      const response = await client.request(CURRENT_USER_QUERY);
      expect(response.me).not.toBeNull();

      await client.request(LOGOUT_MUTATION);
      const response2 = await client.request(CURRENT_USER_QUERY);
      expect(response2.me).toBeNull();
    });
  });

  describe('Request password reset', () => {
    it('checks for bad email', async () => {
      const result = await client.request(REQUEST_RESET_MUTATION, {
        email: 'b',
      });

      const { requestReset } = result;
      const { errors, message } = requestReset;

      expect(message).toBeNull();
      expect(errors).toEqual([
        {
          path: 'email',
          message: emailNotLongEnough,
        },
        {
          path: 'email',
          message: invalidEmail,
        },
      ]);
    });

    it('should send success message even with non existing email', async () => {
      const result = await client.request(REQUEST_RESET_MUTATION, {
        email: faker.internet.email(),
      });

      const { requestReset } = result;
      const { errors, message } = requestReset;

      expect(message).toEqual(requestSuccessful);
      expect(errors).toBeNull();
    });
  });

  describe('Reset password', () => {
    it('checks for valid token', async () => {
      const pass = faker.internet.password();

      const result = await client.request(RESET_PASSWORD_MUTATION, {
        resetToken: 'b',
        password: pass,
        confirmPassword: pass,
      });

      const { resetPassword } = result;
      const { errors, message } = resetPassword;

      expect(message).toBeNull();
      expect(errors).toEqual([
        {
          path: 'confirmPassword',
          message: invalidToken,
        },
      ]);
    });

    it('checks for bad passwords', async () => {
      const { id } = userOne.user;
      const url = await createForgotPasswordLink('', id, redis);

      const parts = url.split('=');
      const resetToken = parts[parts.length - 1];

      const result = await client.request(RESET_PASSWORD_MUTATION, {
        resetToken,
        password: 'fasd',
        confirmPassword: 'd',
      });

      const { resetPassword } = result;
      const { errors, message } = resetPassword;

      expect(message).toBeNull();
      expect(errors).toEqual([
        {
          path: 'password',
          message: passwordNotLongEnough,
        },
        {
          path: 'confirmPassword',
          message: confirmPasswordMismatch,
        },
      ]);
    });

    it('sets new password', async () => {
      // setup logged in user
      const variables = {
        email: userTwo.data.email,
        password: userTwo.rawPassword,
      };

      await client.request(LOGIN_MUTATION, variables);

      const response = await client.request(CURRENT_USER_QUERY);
      expect(response.me).not.toBeNull();

      // setup reset password
      const { id } = userTwo.user;
      const url = await createForgotPasswordLink('', id, redis);

      const parts = url.split('=');
      const resetToken = parts[parts.length - 1];
      const newPassword = faker.internet.password();

      const result = await client.request(RESET_PASSWORD_MUTATION, {
        resetToken,
        password: newPassword,
        confirmPassword: newPassword,
      });

      const { resetPassword } = result;
      const { errors, message } = resetPassword;

      expect(errors).toBeNull();
      expect(message).toEqual(resetSuccessful);

      // expect logged out user
      const response2 = await client.request(CURRENT_USER_QUERY);
      expect(response2.me).toBeNull();

      const result2 = await client.request(RESET_PASSWORD_MUTATION, {
        resetToken,
        password: newPassword,
        confirmPassword: newPassword,
      });

      expect(result2.resetPassword.errors).toEqual([
        {
          path: 'confirmPassword',
          message: invalidToken,
        },
      ]);
    });
  });
});
