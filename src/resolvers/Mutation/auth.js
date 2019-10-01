import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import generateToken from '../../utils/auth/generateToken';
import { formatYupError } from '../../utils/auth/formatYupError';
import {
  validUserSchema,
  validRequestSchema,
  validResetSchema,
} from '../../utils/auth/validationRules';
import {
  duplicateEmail,
  noUserFound,
  invalidPassword,
  requestSuccessful,
  resetSuccessful,
  invalidToken,
} from '../../utils/auth/messages';

import { transport, makeANiceEmail } from '../../mail';

export default {
  async register(_, { email, password, name }, ctx) {
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

    const userAlreadyExists = await ctx.db.exists.User({
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

    const user = await ctx.db.mutation.createUser(
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

    const token = generateToken(user.id);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return { token };
  },
  async login(_, { email, password }, ctx) {
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

    const user = await ctx.db.query.user({
      where: {
        email,
      },
    });

    if (!user) {
      return {
        errors: [
          {
            path: 'email',
            message: noUserFound,
          },
        ],
      };
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return {
        errors: [
          {
            path: 'password',
            message: invalidPassword,
          },
        ],
      };
    }

    const token = generateToken(user.id);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return { token };
  },
  logout(_, __, ctx) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
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
        errors: [
          {
            path: 'email',
            message: noUserFound,
          },
        ],
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
