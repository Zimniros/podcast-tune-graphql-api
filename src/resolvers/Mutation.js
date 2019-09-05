/* eslint-disable import/no-cycle */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { promisify } from 'util';

import { transport, makeANiceEmail } from '../mail';
import fetchCategories from '../utils/population/fetchCategories';
import fetchPodcastsForCategory from '../utils/population/fetchPodcastsForCategory';
import updatePodcastFeed from '../utils/population/updatePodcastFeed';

const Mutations = {
  async register(parent, { email, password, name }, ctx, info) {
    if (!email || email.trim().length === 0) {
      throw new Error(`Email is not provided.`);
    }

    if (!password || password.trim().length === 0) {
      throw new Error(`Password is not provided.`);
    }

    const emailLC = email.toLowerCase();

    const userExists = await ctx.db.exists.User({
      email,
    });

    if (userExists) {
      throw new Error(`Email is already found in our database`);
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
      info
    );

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },
  async login(parent, { email, password }, ctx, info) {
    if (!email || email.trim().length === 0) {
      throw new Error(`Email is not provided.`);
    }

    if (!password || password.trim().length === 0) {
      throw new Error(`Password is not provided.`);
    }

    const user = await ctx.db.query.user({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid Password!');
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return user;
  },
  logout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!' };
  },
  async requestReset(parent, { email }, { db }, info) {
    if (!email || email.trim().length === 0) {
      throw new Error(`Email is not provided.`);
    }

    const user = await db.query.user({ where: { email } });

    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }

    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await db.mutation.updateUser({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const mailRes = await transport.sendMail({
      from: 'help@podcasttune.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`Your Password Reset Token is here!
      \n\n
      <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    });

    return { message: 'Thanks!' };
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

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);

    response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    return updatedUser;
  },
  async updatePodcastFeed(parent, { id }, ctx, info) {
    const episodes = await updatePodcastFeed(id, info);

    return episodes;
  },
  async updateEpisodeDuration(parent, { id, duration }, { db }, info) {
    if (!id || id.trim().length === 0) {
      throw new Error(`Episode id is not provided.`);
    }

    const episode = await db.mutation.updateEpisode({
      where: {
        id,
      },
      data: {
        duration,
        durationVerified: true,
      },
      info,
    });

    return episode;
  },
  async setPlayingEpisode(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingQueueEpisode] = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
        position
      }`
    );

    let episodesToUpdate;
    let episodeToReturn;

    const [existingPlayedEpisode] = await db.query.playedEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingPlayedEpisode) {
      await db.mutation.deletePlayedEpisode({
        where: {
          id: existingPlayedEpisode.id,
        },
      });
    }

    if (existingQueueEpisode) {
      const { position } = existingQueueEpisode;

      episodesToUpdate = await db.query.queueEpisodes(
        {
          where: {
            user: { id: userId },
            position_lt: position,
            id_not: existingQueueEpisode.id,
          },
        },
        `{
          id
          position
        }`
      );

      episodeToReturn = await db.mutation.updateQueueEpisode(
        {
          where: {
            id: existingQueueEpisode.id,
          },
          data: {
            position: 1,
          },
        },
        info
      );
    } else {
      episodesToUpdate = await db.query.queueEpisodes(
        {
          where: {
            user: { id: userId },
          },
        },
        `{
          id
          position
        }`
      );

      episodeToReturn = await db.mutation.createQueueEpisode(
        {
          data: {
            position: 1,
            user: {
              connect: {
                id: userId,
              },
            },
            episode: {
              connect: { id },
            },
          },
        },
        info
      );
    }

    const episodesToUpdateMutations = [];

    for (const episode of episodesToUpdate) {
      const mutation = db.mutation.updateQueueEpisode(
        {
          data: { position: episode.position + 1 },
          where: { id: episode.id },
        },
        info
      );

      episodesToUpdateMutations.push(mutation);
    }

    await Promise.all(episodesToUpdateMutations);

    return episodeToReturn;
  },
  async addEpisodeToQueueNext(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const queue = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
        },
      },
      `{
        id

        episode {
          id
        }
      }`
    );

    const isEpisodeExistsInQueue = queue.some(
      ({ episode }) => episode.id === id
    );

    if (isEpisodeExistsInQueue) {
      throw new Error('Episode is already in queue!');
    }

    const position = queue.length ? 2 : 1;

    const episodeToReturn = await db.mutation.createQueueEpisode(
      {
        data: {
          position,
          user: {
            connect: {
              id: userId,
            },
          },
          episode: {
            connect: { id },
          },
        },
      },
      info
    );

    const episodesToUpdate = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          position_gt: 1,
          id_not: episodeToReturn.id,
        },
      },
      `{
        id
        position
      }`
    );

    const episodesToUpdateMutations = [];

    for (const episode of episodesToUpdate) {
      const mutation = db.mutation.updateQueueEpisode(
        {
          data: { position: episode.position + 1 },
          where: { id: episode.id },
        },
        info
      );

      episodesToUpdateMutations.push(mutation);
    }

    await Promise.all(episodesToUpdateMutations);

    return episodeToReturn;
  },
  async addEpisodeToQueueLast(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const queue = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
        },
      },
      `{
        id

        episode {
          id
        }
      }`
    );

    const isEpisodeExistsInQueue = queue.some(
      ({ episode }) => episode.id === id
    );

    if (isEpisodeExistsInQueue) {
      throw new Error('Episode is already in queue!');
    }

    const position = queue.length + 1;

    const episodeToReturn = await db.mutation.createQueueEpisode(
      {
        data: {
          position,
          user: {
            connect: {
              id: userId,
            },
          },
          episode: {
            connect: { id },
          },
        },
      },
      info
    );

    return episodeToReturn;
  },
  async removeEpisodeFromQueue(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingQueueEpisode] = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
        position
      }`
    );

    if (!existingQueueEpisode) {
      throw new Error(`Queue episode with id '${id}' is not found!`);
    }

    const { position } = existingQueueEpisode;

    const episodesToUpdate = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          position_gt: position,
          id_not: existingQueueEpisode.id,
        },
      },
      `{
          id
          position
        }`
    );

    const episodeToReturn = await db.mutation.deleteQueueEpisode(
      {
        where: {
          id: existingQueueEpisode.id,
        },
      },
      info
    );

    const episodesToUpdateMutations = [];

    for (const episode of episodesToUpdate) {
      const mutation = db.mutation.updateQueueEpisode(
        {
          data: { position: episode.position - 1 },
          where: { id: episode.id },
        },
        info
      );

      episodesToUpdateMutations.push(mutation);
    }

    await Promise.all(episodesToUpdateMutations);

    return episodeToReturn;
  },
  async addEpisodeToFavorites(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingFavoriteEpisode] = await db.query.favoriteEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingFavoriteEpisode) {
      throw new Error('Episode is already in favorites!');
    }

    const episodeToReturn = await db.mutation.createFavoriteEpisode(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          episode: {
            connect: { id },
          },
        },
      },
      info
    );

    return episodeToReturn;
  },
  async removeEpisodeFromFavorites(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingFavoriteEpisode] = await db.query.favoriteEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (!existingFavoriteEpisode) {
      throw new Error(`Favorite episode with id '${id}' is not found!`);
    }

    const episodeToReturn = await db.mutation.deleteFavoriteEpisode(
      {
        where: {
          id: existingFavoriteEpisode.id,
        },
      },
      info
    );

    return episodeToReturn;
  },
  async subscribeToPodcast(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingSubscribedPodcast] = await db.query.subscribedPodcasts(
      {
        where: {
          user: { id: userId },
          podcast: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingSubscribedPodcast) {
      throw new Error('Already subscribed to this podcast!');
    }

    const podcastToReturn = await db.mutation.createSubscribedPodcast(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          podcast: {
            connect: { id },
          },
        },
      },
      info
    );

    return podcastToReturn;
  },
  async unsubscribeFromPodcast(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingSubscribedPodcast] = await db.query.subscribedPodcasts(
      {
        where: {
          user: { id: userId },
          podcast: { id },
        },
      },
      `{
        id
      }`
    );

    if (!existingSubscribedPodcast) {
      throw new Error(`Subscribed podcast with id '${id}' is not found!`);
    }

    const podcastToReturn = await db.mutation.deleteSubscribedPodcast(
      {
        where: {
          id: existingSubscribedPodcast.id,
        },
      },
      info
    );

    return podcastToReturn;
  },
  async setPlayedTime(parent, { id, playedTime }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingInProgressEpisode] = await db.query.inProgressEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    let episodeToReturn;

    if (existingInProgressEpisode) {
      episodeToReturn = await db.mutation.updateInProgressEpisode(
        {
          where: {
            id: existingInProgressEpisode.id,
          },
          data: {
            playedTime,
          },
        },
        info
      );
    } else {
      episodeToReturn = await db.mutation.createInProgressEpisode(
        {
          data: {
            playedTime,
            user: {
              connect: {
                id: userId,
              },
            },
            episode: {
              connect: { id },
            },
          },
        },
        info
      );
    }

    return episodeToReturn;
  },
  async markEpisodeAsPlayed(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingPlayedEpisode] = await db.query.playedEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingPlayedEpisode) {
      throw new Error('Episode already marked as played!');
    }

    const mutationsToPerform = [];

    const [existingInProgressEpisode] = await db.query.inProgressEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (existingInProgressEpisode) {
      const mutation = db.mutation.deleteInProgressEpisode({
        where: {
          id: existingInProgressEpisode.id,
        },
      });

      mutationsToPerform.push(mutation);
    }

    const [existingQueueEpisode] = await db.query.queueEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
        position
      }`
    );

    let episodesToUpdate;

    if (existingQueueEpisode) {
      const mutation = db.mutation.deleteQueueEpisode({
        where: {
          id: existingQueueEpisode.id,
        },
      });

      mutationsToPerform.push(mutation);

      const { position } = existingQueueEpisode;

      episodesToUpdate = await db.query.queueEpisodes(
        {
          where: {
            user: { id: userId },
            position_gt: position,
            id_not: existingQueueEpisode.id,
          },
        },
        `{
          id
          position
        }`
      );
    }

    for (const episode of episodesToUpdate) {
      const mutation = db.mutation.updateQueueEpisode(
        {
          data: { position: episode.position - 1 },
          where: { id: episode.id },
        },
        info
      );

      mutationsToPerform.push(mutation);
    }

    await Promise.all(mutationsToPerform);

    const episodeToReturn = await db.mutation.createPlayedEpisode(
      {
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          episode: {
            connect: { id },
          },
        },
      },
      info
    );

    return episodeToReturn;
  },
  async markEpisodeAsUnplayed(parent, { id }, { request, db }, info) {
    const { userId } = request;

    if (!userId) {
      throw new Error('You must be logged in to do that!');
    }

    const [existingPlayedEpisode] = await db.query.playedEpisodes(
      {
        where: {
          user: { id: userId },
          episode: { id },
        },
      },
      `{
        id
      }`
    );

    if (!existingPlayedEpisode) {
      throw new Error(`Played episode with id '${id}' is not found!`);
    }

    const episodeToReturn = await db.mutation.deletePlayedEpisode(
      {
        where: {
          id: existingPlayedEpisode.id,
        },
      },
      info
    );

    return episodeToReturn;
  },

  /*
      Data population methods
  */

  // Initial Data Population for Categories
  async getCategories(parent, args, { db }, info) {
    const categoriesData = await fetchCategories();
    await db.mutation.deleteManyCategories();

    const promises = [];

    categoriesData.forEach(category => {
      const upsertPromise = db.mutation.createCategory({
        data: {
          ...category,
        },
      });
      promises.push(upsertPromise);
    });

    const categories = await Promise.all(promises);

    return categories;
  },
  // Initial Data Population for Podcast preview for each category
  async getPodcastsForAllCategories(
    parent,
    { limit = 200, country = 'US', first = 67, skip = 0 },
    { db, request },
    info
  ) {
    request.setTimeout(0);
    const categories = await db.query.categories({
      first,
      skip,
    });

    // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop/37576787#37576787

    console.log(`==============================`);
    console.log(`Getting podcast for categories`);
    console.log(`==============================`);
    console.time('All podcast for categories fetched in');

    for (const category of categories) {
      const { itunesId, name } = category;

      console.log(
        `Getting podcasts for category '${name}' (${itunesId}). Category ${categories.findIndex(
          el => el.itunesId === itunesId
        ) + 1} out of ${categories.length}`
      );
      console.time(`  Podcasts for category ${itunesId} fetched in`);
      await fetchPodcastsForCategory({ categoryId: itunesId, limit, country });

      console.timeEnd(`  Podcasts for category ${itunesId} fetched in`);
    }

    console.log(`==============================`);
    console.timeEnd('All podcast for categories fetched in');
    console.log(`==============================`);

    return true;
  },
  async getPodcastsForCategory(
    parent,
    { categoryId, limit = 200, country = 'US' },
    { db, request },
    info
  ) {
    request.setTimeout(0);

    const exists = await db.query.category({
      where: {
        itunesId: categoryId,
      },
    });

    if (!exists)
      throw new Error(`Category with id '${categoryId}' doesn't exist.`);

    console.log(`==============================`);
    console.log(`Getting podcasts for category`);
    console.log(`==============================`);
    console.time(`All podcasts for category '${categoryId}' fetched in`);

    await fetchPodcastsForCategory({ categoryId, limit, country });

    console.log(`==============================`);
    console.timeEnd(`All podcasts for category '${categoryId}' fetched in`);
    console.log(`==============================`);

    return true;
  },
};

export { Mutations as default };
