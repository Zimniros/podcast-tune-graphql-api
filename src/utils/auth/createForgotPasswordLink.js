import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { forgotPasswordPrefix } from '../../constants';

export const createForgotPasswordLink = async (url, userId, redis) => {
  const randomBytesPromiseified = promisify(randomBytes);
  const resetToken = (await randomBytesPromiseified(20)).toString('hex');

  await redis.set(
    `${forgotPasswordPrefix}${resetToken}`,
    userId,
    'ex',
    60 * 20
  );
  return `${url}/reset?resetToken=${resetToken}`;
};
