import { GraphQLClient } from 'graphql-request';

global.fetch = require('fetch-cookie/node-fetch')(require('node-fetch'));

const getClient = () =>
  new GraphQLClient(`http://localhost:${process.env.PORT || 1000}`, {
    credentials: 'include',
  });

export { getClient as default };
