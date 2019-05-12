import jwt from 'jsonwebtoken';

const maxAgeDefault = 1000 * 60 * 60 * 24 * 30; // 30 days cookie

const generateCookie = ({ userId, maxAge = maxAgeDefault }) => {
  const token = jwt.sign({ userId }, process.env.APP_SECRET);

  return [
    'token',
    token,
    {
      httpOnly: true,
      maxAge,
    },
  ];
};

export { generateCookie as default };
