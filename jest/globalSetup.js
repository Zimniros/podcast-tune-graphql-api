/* eslint-disable import/no-extraneous-dependencies */
require('@babel/register');
const createServer = require('./../src/createServer').default;

const server = createServer();

module.exports = async () => {
  global.httpServer = await server.start();
};
