import bcrypt from 'bcryptjs';
import * as faker from 'faker';
import db from '../../db';

const passwordOne = faker.internet.password();

const userOne = {
  data: {
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync(passwordOne, 10),
    name: faker.name.firstName(),
  },
  rawPassword: passwordOne,
  user: undefined,
};

const passwordTwo = faker.internet.password();

const userTwo = {
  data: {
    email: faker.internet.email().toLowerCase(),
    password: bcrypt.hashSync(passwordTwo, 10),
    name: faker.name.firstName(),
  },

  rawPassword: passwordTwo,
  user: undefined,
};

const podcastOne = {
  data: {
    itunesId: 160904630,
    title: 'TED Talks Daily',
    titleLC: 'ted talks daily',
    author: 'TED',
    authorLC: 'ted',
    categories: {
      connect: [{ itunesId: 1301 }, { itunesId: 1318 }],
    },
    description:
      "Want TED Talks on the go? Every weekday, this feed brings you our latest talks in audio format. Hear thought-provoking ideas on every subject imaginable -- from Artificial Intelligence to Zoology, and everything in between -- given by the world's leading thinkers and doers. This collection of talks, given at TED and TEDx conferences around the globe, is also available in video format.",
    itunesUrl:
      'https://podcasts.apple.com/us/podcast/ted-talks-daily/id160904630?uo=4',
    feedUrl: 'http://feeds.feedburner.com/TEDTalks_audio',
    websiteUrl: 'https://www.ted.com/talks',
    artworkLarge:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/79/9c/44/799c444a-ce56-3e2b-7dc8-a5399255c427/mza_6262794307050744120.png/600x600bb.jpg',
    artworkSmall:
      'https://is1-ssl.mzstatic.com/image/thumb/Podcasts113/v4/79/9c/44/799c444a-ce56-3e2b-7dc8-a5399255c427/mza_6262794307050744120.png/100x100bb.jpg',
  },
  podcast: undefined,
};

const categoryOne = {
  data: {
    itunesId: 1318,
    name: 'Technology',
  },
  category: undefined,
};

const categoryTwo = {
  data: {
    itunesId: 1489,
    name: 'News',
  },
  category: undefined,
};

const categoryThree = {
  data: {
    itunesId: 1528,
    name: 'Tech News',
  },
  category: undefined,
};

const categoryFour = {
  data: {
    itunesId: 1301,
    name: 'Arts',
  },
  category: undefined,
};

const seedDatabase = async () => {
  await db.mutation.deleteManyUsers();
  await db.mutation.deleteManyPodcasts();
  await db.mutation.deleteManyCategories();

  // Create user one
  userOne.user = await db.mutation.createUser({
    data: userOne.data,
  });

  // Create user two
  userTwo.user = await db.mutation.createUser({
    data: userTwo.data,
  });

  categoryOne.category = await db.mutation.createCategory({
    data: categoryOne.data,
  });

  categoryTwo.category = await db.mutation.createCategory({
    data: categoryTwo.data,
  });

  categoryThree.category = await db.mutation.createCategory({
    data: categoryThree.data,
  });

  categoryFour.category = await db.mutation.createCategory({
    data: categoryFour.data,
  });

  podcastOne.podcast = await db.mutation.createPodcast({
    data: podcastOne.data,
  });
};
export default seedDatabase;
export { userOne, userTwo, podcastOne };
