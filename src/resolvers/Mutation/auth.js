import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import generateToken from '../../utils/auth/generateToken';
import { formatYupError } from '../../utils/auth/formatYupError';
import {
  validUserSchema,
  validResetSchema,
} from '../../utils/auth/validationRules';
import {
  duplicateEmail,
  noUserFound,
  invalidPassword,
  requestSuccessful,
} from '../../utils/auth/messages';

import { transport, makeANiceEmail } from '../../mail';

export default {
  async register(parent, { email, password, name }, ctx, info) {
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
  async login(parent, { email, password }, ctx, info) {
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
  logout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
  async requestReset(parent, { email }, { db }, info) {
    try {
      await validResetSchema.validate(
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

    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const mailRes = await transport.sendMail({
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
  async resetPassword(
    parent,
    { password, confirmPassword, resetToken },
    { db, response },
    info
  ) {
    if (!password || password.trim().length === 0) {
      throw new Error(`Password is not provided.`);
    }

    if (!confirmPassword || confirmPassword.trim().length === 0) {
      throw new Error(`Password confirmation is not provided.`);
    }

    if (password !== confirmPassword) {
      throw new Error("Yo Passwords don't match!");
    }

    const [user] = await db.query.users({
      where: {
        resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!');
    }

    const newPassword = await bcrypt.hash(password, 10);

    const updatedUser = await db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password: newPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    const token = generateToken(user.id);

    response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return updatedUser;
  },
};
