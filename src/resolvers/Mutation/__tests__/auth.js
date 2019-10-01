import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';
import getClient from '../../../utils/testUtils/getClient';
import db from "../../../db";
import generateToken from '../../../utils/auth/generateToken';

const client = getClient();

const REGISTER_MUTATION = gql`
  mutation REGISTER_MUTATION(
    $email: String!
    $password: String!
    $name: String
  ) {
    register(email: $email, password: $password, name: $name) {
      id
      name
      email
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
  await db.mutation.deleteManyUsers();
});

describe('auth mutations', () => {
  it('register', async () => {
    // const client = getClient(
    //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjazBwZ2d1OGswMDIxMDcxN29seGJ0cTVyIiwiaWF0IjoxNTY4ODIyNTk1fQ.ipGtPd3GhuLlwHaCY08SKVaji57q6rOQT5QwYOXfW8Y'
    // );

    // const variables = {
    //   name: 'John',
    //   email: 'andasczddasrewczx@examdsadcxzczasdasple.com',
    //   password: 'MyPass123',
    // };

    // const result = await client.mutate({
    //   mutation: REGISTER_MUTATION,
    //   variables,
    // });

    // console.log(result.data.register.id);
    // console.log('generateToken', generateToken(result.data.register.id));

    const result2 = await client.query({ query: CURRENT_USER_QUERY });
    console.log(result2);
  });
});
