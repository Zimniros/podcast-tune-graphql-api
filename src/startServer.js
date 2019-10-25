import session from 'express-session';
import connectRedis from 'connect-redis';
import redis from './redis';
import createServer from './createServer';

import { redisSessionPrefix } from './constants';

export const startServer = async () => {
  const server = createServer();
  const RedisStore = connectRedis(session);

  if (process.env.NODE_ENV === 'test') {
    await redis.flushall();
  }

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

  const cors = {
    credentials: true,
    origin: process.env.NODE_ENV === 'test' ? '*' : process.env.FRONTEND_URL,
  };
  const port = process.env.PORT || 4000;

  const app = await server.start({
    cors,
    port,
  });
  console.log(`Server is running on localhost:${port}`);

  return app;
};
