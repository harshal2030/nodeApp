import request from 'supertest';
import app from '../src/app';
import { seedDb, TruncateTables, user1, user2, post1, post2 } from './fixtures/db';
import { Post } from '../src/models/Post';
import { Like } from '../src/models/Like';

interface PostRequestBody {
    title: string;
    description: string;
}

beforeAll(seedDb)

const post: PostRequestBody = {
    title: 'sdjhsdfkjhsdf',
    description: 'sdjfhsdkjfhsdfsdjkfh',
}

describe("Post related tests", () => {
    test("Should post a post if authorized", async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .field('info', JSON.stringify(post))
            .expect(201)
    })

    test("Should not post if empty", async () => {
        await request(app)
            .post('/posts')
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .field('info', JSON.stringify({
                title: '',
                description: ''
            }))
            .expect(400)
    })

    test("Should not post if no auth token", async () => {
        await request(app)
            .post('/posts')
            .field('info', JSON.stringify(post))
            .expect(401)
    })

    test("Should get home feed posts", async () => {
        const res = await request(app)
            .get('/posts')
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(200)

        expect(res.body).toHaveProperty('maxDate')
        expect(res.body).toHaveProperty('minDate')
        expect(res.body).toHaveProperty('data')
        expect(res.body.data.length).toBeLessThanOrEqual(20)

        const res2 = await request(app)
            .get('/posts?limit=0')
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(200)
        
        expect(res2.body.data.length).toBe(0)
    })

    test("Should not get home feed if no token", async () => {
        await request(app)
            .get('/posts')
            .expect(401)
    })
})

describe("Posting comments and registering likes tests", () => {
    test("Should post a comment", async () => {
        await request(app)
            .post(`/posts/${post1.postId}/comment`)
            .field('info', JSON.stringify({
                commentValue: 'testhjsldfgjhsldk lsdkfj sdf'
            }))
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(201)
        
        const comment = await Post.findOne({
            where: {
                replyTo: post1.postId,
            }
        })

        expect(comment).not.toBe(null)
    })

    test("Should not comment on invalid postId", async () => {
        await request(app)
            .post('/posts/sdfsdfsdfsdf/comment')
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .field('info', JSON.stringify({
                commentValue: 'sdjfhsodj hshfg sdfgh ksdhfksdfhkshjd'
            }))
            .expect(500)
    })

    test("should not comment if no token", async () => {
        await request(app)
            .post(`/posts/${post1.postId}/comment`)
            .field('info', JSON.stringify({
                commentValue: 'kkjglsdfjg ldfjgh dfghldfgjhldffghldf'
            }))
            .expect(401)
    })

    test("Should regsiter the like on post", async () => {
        const res = await request(app)
            .patch('/posts/like')
            .send({
                postId: post1.postId,
            })
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(200)

        expect(res.body).toHaveProperty('likes')
        const likeExists = await Like.findOne({
            where: {
                postId: post1.postId,
                likedBy: user1.username
            }
        })

        expect(likeExists).not.toBe(null)

        const res2 = await request(app)
            .patch('/posts/like')
            .send({
                postId: post1.postId,
            })
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(200)

        expect(res.body).toHaveProperty('likes')
        const likeNotExists = await Like.findOne({
            where: {
                postId: post1.postId,
                likedBy: user1.username
            }
        })

        expect(likeNotExists).toBe(null);
    })
})

describe("Get likes, comments, stars, stargazers tests", () => {
    test("Should get media posted by user", async () => {
        const res = await request(app)
            .get(`/posts/${user1.username}/media`)
            .set('Authorization', `Bearer ${user2.tokens[0]}`)
            .expect(200)

        expect(Array.isArray(res.body)).toBe(true)
        expect(res.body.length).toBeGreaterThanOrEqual(0)
    })

    test("Should get posts of a user", async () => {
        const res = await request(app)
            .get(`/posts/${user2.username}`)
            .expect(200)
        
        console.log(res.status);
        console.log(res.body);
    })
})

afterAll(TruncateTables)