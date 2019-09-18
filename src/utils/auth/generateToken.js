import jwt from 'jsonwebtoken';

const generateToken = userId => jwt.sign({ userId }, process.env.APP_SECRET);

export { generateToken as default };
