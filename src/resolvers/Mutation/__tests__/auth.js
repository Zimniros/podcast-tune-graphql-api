import runQuery from '../../../utils/testUtils/run';

const REGISTER_MUTATION = `
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

describe('auth mutations', () => {
  it('should do something', async () => {
    const result = await runQuery(REGISTER_MUTATION);

    console.log(result);
  });
});
