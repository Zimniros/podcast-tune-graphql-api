import './config';

import cookieParser from 'cookie-parser';
import createServer from './createServer';
import db from './db';

const server = createServer();

server.express.use(cookieParser());
// TODO Use express middleware to populate current user

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`Server is now runnin on port http://localhost:${deets.port}`);
  }
);
