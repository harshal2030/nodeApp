const request = require('supertest');
const app = require('./../src/app');
const {setupDatabse, user1} = require('./fixtures/db')

beforeAll(setupDatabse)

const tempUser = {
    name: "kavya",
    username: "kavya2030",
    email: "kavya@example.com",
    adm_num: "23234",
    dob: "2003-03-12",
    password: "qwertyy",
}

const createTempUser = async () => {
    const response = await request(app)
    .post("/users")
    .send({
        name: "kavya",
        username: "kavya2030",
        email: "kavya@example.com",
        adm_num: "23234",
        dob: "2003-03-12",
        password: "qwertyy",
    })
    .expect(201)

tempUser['token'] = response.body.token
}
createTempUser();

test("Should get the user feed", async () => {
    const res = await request(app)
        .get('/posts')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .expect(200)

    const posts = res.body;
    for (let i=0; i<posts.length; i++) {
        expect(posts[i]).toHaveProperty('bookmarked')
        expect(posts[i]).toHaveProperty('liked')
    }
})

test("Should not get feed for unathorized", async () => {
    await request(app)
        .get('/posts')
        .expect(401)
})

test("Should get user media if authenticated", async () => {
    await request(app)
        .get(`/posts/${user1.username}/media`)
        .set('Authorization', `Bearer ${tempUser.token}`)
        .expect(404)
    
    await request(app)
        .get('/posts/${user1.username}/media')
        .expect(401)
})

test("Should get the user stars if authenticated", async () => {
    const res = await request(app)
        .get(`/posts/${user1.username}/stars`)
        .set('Authorization', `Bearer ${tempUser.token}`)
        .expect(404)

    console.log(res);

    await request(app)
        .get(`/posts/${user1.username}/stars`)
        .expect(401)
})
