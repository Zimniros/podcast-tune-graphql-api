import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import createServer from './createServer';

const server = createServer();

server.express.use(cookieParser());

server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }
  next();
});

export default server;
