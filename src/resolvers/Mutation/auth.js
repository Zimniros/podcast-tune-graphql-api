import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { removeAllUsersSessions } from '../../utils/auth/removeAllUsersSessions';
import { formatYupError } from '../../utils/auth/formatYupError';
import {
  validUserSchema,
  validRequestSchema,
  validResetSchema,
} from '../../utils/auth/validationRules';
import {
  duplicateEmail,
  invalidLogin,
  requestSuccessful,
  resetSuccessful,
  invalidToken,
} from '../../utils/auth/messages';

import { transport, makeANiceEmail } from '../../mail';

export default {
  async register(
    _,
    { email, password, name },
    { db, redis, session, request }
  ) {
    try {
      await validUserSchema.validate(
        {
          email,
          password,
        },
        { abortEarly: false }
      );
    } catch (error) {
      return { errors: formatYupError(error) };
    }

    const emailLC = email.toLowerCase();

    const userAlreadyExists = await db.exists.User({
      email,
    });

    if (userAlreadyExists) {
      return {
        errors: [
          {
            path: 'email',
            message: duplicateEmail,
          },
        ],
      };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await db.mutation.createUser(
      {
        data: {
          email: emailLC,
          name,
          password: encryptedPassword,
          permissions: { set: ['USER'] },
        },
      },
      `{
        id
      }`
    );

    session.userId = user.id;
    if (request.sessionID) {
      await redis.lpush(`${'userSids:'}${user.id}`, request.sessionID);
    }

    return { token: request.sessionID };
  },
  async login(_, { email, password }, { db, redis, session, request }) {
    try {
      await validUserSchema.validate(
        {
          email,
          password,
        },
        { abortEarly: false }
      );
    } catch (error) {
      return { errors: formatYupError(error) };
    }

    const user = await db.query.user({
      where: {
        email,
      },
    });

    if (!user) {
      return {
        errors: [
          {
            path: 'email',
            message: invalidLogin,
          },
        ],
      };
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return {
        errors: [
          {
            path: 'email',
            message: invalidLogin,
          },
        ],
      };
    }

    session.userId = user.id;
    if (request.sessionID) {
      await redis.lpush(`${'userSids:'}${user.id}`, request.sessionID);
    }

    return { token: request.sessionID };
  },
  logout(_, __, { session, redis, response }) {
    const { userId } = session;
    if (userId) {
      removeAllUsersSessions(userId, redis);
      session.destroy(err => {
        if (err) {
          console.log(err);
        }
      });
      response.clearCookie('qid');
      return true;
    }

    return false;
  },
  async requestReset(_, { email }, { db }) {
    try {
      await validRequestSchema.validate(
        {
          email,
        },
        { abortEarly: false }
      );
    } catch (error) {
      return { errors: formatYupError(error) };
    }

    const user = await db.query.user({ where: { email } });

    if (!user) {
      return {
        message: requestSuccessful,
      };
    }

    /*
      TODO: 1. prevent doing more than 1 request per 20 min.
            2. lock user account 
    */
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    await db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    await transport.sendMail({
      from: 'help@podcast-tune.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is here!
    \n\n
    <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    });

    return {
      message: requestSuccessful,
    };
  },
  async resetPassword(_, { password, confirmPassword, resetToken }, { db }) {
    try {
      await validResetSchema.validate(
        {
          password,
          confirmPassword,
        },
        { abortEarly: false }
      );
    } catch (error) {
      return { errors: formatYupError(error) };
    }

    const [user] = await db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });

    if (!user) {
      return {
        errors: [
          {
            path: 'confirmPassword',
            message: invalidToken,
          },
        ],
      };
    }

    const newPassword = await bcrypt.hash(password, 10);

    await db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: resetSuccessful };
  },
};
