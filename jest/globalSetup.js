/* eslint-disable import/no-extraneous-dependencies */
require('@babel/register');
const server = require('./../src/server').default;

module.exports = async () => {
  global.httpServer = await server.start({
    port: process.env.TEST_PORT || 1000,
  });
};
