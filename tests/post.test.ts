import request from 'supertest';
import app from '../src/app';
import { seedDb, TruncateTables, user1, user2 } from './fixtures/db';

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

    test("Shoulg get home feed posts", async () => {
        const res = await request(app)
            .get('/posts')
            .set('Authorization', `Bearer ${user1.tokens[0]}`)
            .expect(200)

        expect(res.body).toHaveProperty('maxDate')
        expect(res.body).toHaveProperty('minDate')
        expect(res.body).toHaveProperty('data')
        expect(res.body.data.length).toBeLessThanOrEqual(20)
    })
})

afterAll(TruncateTables)