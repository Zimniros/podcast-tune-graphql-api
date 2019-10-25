/* eslint-disable import/no-extraneous-dependencies */
require('@babel/register');
const { startServer } = require('./../src/startServer');

module.exports = async () => {
  global.httpServer = await startServer();
};
