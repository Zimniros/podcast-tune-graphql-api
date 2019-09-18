import ApolloBoost from 'apollo-boost';

const getClient = jwt =>
  new ApolloBoost({
    uri: `http://localhost:${process.env.TEST_PORT || 1000}`,
    request(operation) {
      if (jwt) {
        operation.setContext({
          fetchOptions: {
            credentials: 'include',
          },
          headers: {
            cookie: `token=${jwt}`,
          },
        });
      }
    },
  });

export { getClient as default };
