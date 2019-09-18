import server from './server';

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
