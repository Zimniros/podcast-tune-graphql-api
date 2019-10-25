import session from 'express-session';
import connectRedis from 'connect-redis';
import redis from './redis';
import createServer from './createServer';

import { redisSessionPrefix } from './constants';

const server = createServer();
const RedisStore = connectRedis(session);

server.express.use(
  session({
    store: new RedisStore({
      client: redis,
      prefix: redisSessionPrefix,
    }),
    name: 'qid',
    secret: process.env.APP_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  })
);

export default server;
