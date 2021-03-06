import { sign } from 'jsonwebtoken';
import { join } from 'path';
import { readFileSync } from 'fs';
import { nanoid } from 'nanoid';
import { User } from '../../src/models/User';
import { Post } from '../../src/models/Post';
import { Bookmark } from '../../src/models/Bookmark';
import { Like } from '../../src/models/Like';
import { Friend } from '../../src/models/Friend';
import { Tag } from '../../src/models/Tag';
import { Tracker } from '../../src/models/Tracker';

const privateKeyPath = join(__dirname, '../../src/keys/private.key');
const privateKey = readFileSync(privateKeyPath, 'utf-8');

interface TestUser {
    name: string;
    username: string;
    email: string;
    dob: string; // in yyyy-mm-dd
    password: string;
    tokens: string[];
}

interface TestPost {
    postId: string;
    username: string;
    sharable?: boolean;
    replyTo?: string;
    parentId?: string;
    title: string;
    description: string;
    likes?: number;
    comments?: number;
}

export const user1: TestUser = {
  name: 'harshal',
  username: 'harshal',
  email: 'har@ex.com',
  dob: '2003-01-19',
  password: 'mypass123',
  tokens: [sign({ username: 'harshal' }, privateKey, { algorithm: 'RS256' })],
};

export const user2: TestUser = {
  name: 'user2',
  username: 'user2',
  email: 'user2@ex.com',
  dob: '2003-01-19',
  password: 'fgdsfgsdfg',
  tokens: [sign({ username: 'user2' }, privateKey, { algorithm: 'RS256' })],
};

export const post1: TestPost = {
  postId: nanoid(),
  username: 'harshal',
  title: 'testing1',
  description: 'this is testin 1',
};

export const post2: TestPost = {
  postId: nanoid(),
  username: 'user2',
  title: 'testing',
  description: 'this is testing',
};

export const seedDb = async () => {
  try {
    await User.sync();
    await Post.sync();
    await User.bulkCreate([user1, user2]);
    await Post.bulkCreate([post1, post2]);
  } catch (e) {
    console.log(e);
  }
};

export const TruncateTables = async () => {
  try {
    await User.destroy({ truncate: true });
    await Post.destroy({ truncate: true });
    await Bookmark.destroy({ truncate: true });
    await Like.destroy({ truncate: true });
    await Friend.destroy({ truncate: true });
    await Tag.destroy({ truncate: true });
    await Tracker.destroy({ truncate: true });
  } catch (e) {
    console.log(e);
  }
};
