import User from '../../src/models/user';
import Post from '../../src/models/post';
import { sign } from 'jsonwebtoken';
import { join } from 'path';
import { readFileSync } from 'fs';

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
    username: string;
    sharable?: boolean;
    replyTo?: string;
    parentId?: string;
    title: string;
    description: string;
    likes?: number;
    comments?: number;
}

const user1: TestUser = {
    name: 'harshal',
    username: 'harshal',
    email: 'har@ex.com',
    dob: '2003-01-19',
    password: 'jsdhgklsdjfh',
    tokens: [sign({ username: 'harshal' }, privateKey, {algorithm: 'RS256'})]
};

const user2: TestUser = {
    name: 'user2',
    username: 'user2',
    email: 'user2@ex.com',
    dob: '2003-01-19',
    password: 'fgdsfgsdfg',
    tokens: [sign({ username: 'user2' }, privateKey, { algorithm: 'RS256' })]
}

const post1: TestPost = {
    username: 'harshal',
    title: 'testing1',
    description: 'this is testin 1'
}

const post2: TestPost = {
    username: 'user2',
    title: 'testing',
    description: 'this is testing'
}

const seedDb = async () => {
    try {
        await User.sync();
        await Post.sync();
        await User.bulkCreate([user1, user2]);
        await Post.bulkCreate([post1, post2]);
        console.log('hello dev');
    } catch (e) {
        console.log(e);
    }
}

seedDb();
