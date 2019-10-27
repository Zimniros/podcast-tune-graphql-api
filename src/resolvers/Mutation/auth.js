import bcrypt from 'bcryptjs';
import { createForgotPasswordLink } from '../../utils/auth/createForgotPasswordLink';
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
import { userSessionIdPrefix, forgotPasswordPrefix } from '../../constants';

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
      await redis.lpush(`${userSessionIdPrefix}${user.id}`, request.sessionID);
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
      await redis.lpush(`${userSessionIdPrefix}${user.id}`, request.sessionID);
    }

    return { token: request.sessionID };
  },
  logout(_, __, { session, response }) {
    const { userId } = session;

    if (userId) {
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
  async requestReset(_, { email }, { db, redis }) {
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

    const user = await db.query.user({ where: { email } }, `{id}`);

    if (!user) {
      return {
        message: requestSuccessful,
      };
    }

    /*
      TODO: 1. prevent doing more than 1 request per 20 min.
            2. lock user account 
    */

    const url = await createForgotPasswordLink(
      process.env.FRONTEND_URL,
      user.id,
      redis
    );

    await transport.sendMail({
      from: 'help@podcast-tune.com',
      to: email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is here!
    \n\n
    <a href="${url}">Click Here to Reset</a>`),
    });

    return {
      message: requestSuccessful,
    };
  },
  async resetPassword(
    _,
    { password, confirmPassword, resetToken },
    { db, redis }
  ) {
    const redisKey = `${forgotPasswordPrefix}${resetToken}`;

    const userId = await redis.get(redisKey);

    if (!userId) {
      return {
        errors: [
          {
            path: 'confirmPassword',
            message: invalidToken,
          },
        ],
      };
    }

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

    const newPassword = await bcrypt.hash(password, 10);

    const updatePromise = db.mutation.updateUser({
      where: { id: userId },
      data: {
        password: newPassword,
      },
    });

    const deleteKeyPromise = redis.del(redisKey);
    const removeAllSessionsPromise = removeAllUsersSessions(userId, redis);

    await Promise.all([
      updatePromise,
      deleteKeyPromise,
      removeAllSessionsPromise,
    ]);

    return { message: resetSuccessful };
  },
};
