import request from 'supertest';
import app from '../src/app';
import { seedDb, TruncateTables, user1, user2 } from './fixtures/db';
import User from '../src/models/user';
import Friend from '../src/models/friend';

jest.useFakeTimers();

beforeAll(seedDb);

interface UserRequestBody {
    user: {
        name: string;
        username: string;
        email: string;
        password: string;
        dob: string;
    }
    device?: object;
}

const user: UserRequestBody = {
    user: {
        name: 'harshal',
        username: 'unique',
        email: 'hars@ex.com',
        password: 'kjfhgldkjfg',
        dob: '2003-01-01'
    }
}

describe("Account creation and login tests", () => {

    test("Should create a account", async () => {
        const res = await request(app)
            .post('/users')
            .send(user)
            .expect(201);

        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).not.toHaveProperty('email');
        expect(res.body.user).not.toHaveProperty('phone');
        expect(res.body.user).not.toHaveProperty('password');
        expect(res.body.user).not.toHaveProperty('tokens');

        const dbUser = await User.findOne({
            where: {
                username: user.user.username,
            },
            raw: true,
        })

        expect(dbUser.tokens.length).toBeGreaterThanOrEqual(1);
    })

    test.each([
        ['email', 'harshal', 'afsdf', 'asdas', 'asdfsdf', '2003-01-01', 400],
        ['name', '', 'sdfsdf', 'asdas@ex.com', 'sdfsdffsdf', '2003-01-01', 400],
        ['username', 'dfgdfg', 'sdfsdf sdfsd', 'asdas@ex.com', 'sdfsdffsdf', '2003-01-01', 400],
        ['password', 'wrewr', 'sdfsdf', 'asdas@ex.com', 'sd', '2003-01-01', 400]
    ])('Should return 400 for invalid %s', async (invalid, name, username, email, password, dob, expected) => {
        const user: UserRequestBody = {
            user: {
                name,
                username,
                email,
                password,
                dob,
            }
        }

        await request(app)
            .post('/users')
            .send(user)
            .expect(expected);
    })
      
    test("Should login the the user", async () => {
        const res = await request(app)
            .post('/users/login')
            .send({
                user: {
                    email: user.user.email,
                    password: user.user.password,
                }
            })
            .expect(200)
        
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).not.toHaveProperty('email');
        expect(res.body.user).not.toHaveProperty('phone');
        expect(res.body.user).not.toHaveProperty('password');
        expect(res.body.user).not.toHaveProperty('tokens');

        const dbUser = await User.findOne({
            where: {
                username: user.user.username,
            },
            raw: true,
        });

        expect(dbUser.tokens.length).toBeGreaterThanOrEqual(1);
    })

    test("Should not login no existing user", async () => {
        await request(app)
            .post('/users/login')
            .send({
                user: {
                    email: 'sdfsd@ex.com',
                    password: 'ksjdflsdkfjl',
                }
            })
            .expect(404);
    })
})

describe("Profile, Friends tests", () => {
    test("Should get existing user profile", async () => {
        await request(app)
            .get(`/users/${user.user.username}`)
            .expect(200);
    })

    test("Should include isFollowing, follows_you props when authorization header is present", async () => {
        const res = await request(app)
            .get(`/users/${user.user.username}`)
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(200)

        expect(res.body).toHaveProperty('isFollowing')
        expect(res.body).toHaveProperty('follows_you')
    })

    test("Should add follower to a user", async () => {
        await request(app)
            .post('/users/follow')
            .send({
                username: user.user.username
            })
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(201)

        const dbFriend = await Friend.findOne({
            where: {
                username: user1.username,
                followed_username: user.user.username
            },
            raw: true,
        })

        expect(dbFriend).not.toBe(null);
    })

    test.each([
        ['provided identical pair', user1.username, user1.tokens[0]],
        ["user doesn't exists", 'sdfsdfsdf', user1.tokens[0]]
    ])('Should return 400 if %s', async (testName, username, token) => {
        await request(app)
            .post('/users/follow')
            .send({
                username,
            })
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
    })

    test("Should unfollow a user", async () => {
        await request(app)
            .delete('/users/follow')
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .send({
                username: user.user.username
            })
            .expect(200)

        const dbFriend = await Friend.findOne({
            where: {
                username: user1.username,
                followed_username: user.user.username,
            },
            raw: true,
        })

        expect(dbFriend).toBe(null)
    })

    test.each([
        ['provided identical pair', user1.username, user1.tokens[0]],
        ["if user doesn't exists", user2.username, user1.tokens[0]]
    ])("Should return 400 if %s", async (testName, username, token) => {
        await request(app)
            .delete('/users/follow')
            .set('Authorization', `Bearer ${token}`)
            .send({ username })
            .expect(400)
    })

    test.each([
        ['followings', `/users/${user1.username}/following`, user1.tokens[0]],
        ['followers', `/users/${user1.username}/followers`, user1.tokens[0]],
    ])(`Should get user %s`, async (testName, url, token) => {
        const res = await request(app)
            .get(url)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(res.body).toEqual(expect.any(Array))
    })
})

describe("Log out tests", () => {
    test("should logout user", async () => {
        await request(app)
            .post('/users/logout')
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(200)
    })

    test("Should not logout the user without auth token", async () => {
        await request(app)
            .post('/users/logout')
            .expect(401)
    })

    test("Should logout From all devices", async () => {
        await request(app)
            .post('/users/logoutAll')
            .set('Authorization', `Bearer ${user2.tokens[0]}`)
            .expect(200)
    })
 
    test("Should not logout All if unauthorized", async () => {
        await request(app)
            .post('/users/logoutAll')
            .expect(401)
    })
})

afterAll(TruncateTables);
