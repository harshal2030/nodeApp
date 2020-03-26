const request = require("supertest");
const app = require("./../src/app")
const User = require("./../src/models/user");
const {setupDatabse, user1} = require("./fixtures/db")

beforeAll(setupDatabse);

const tempUser = {
    name: "kavya",
    username: "kavya2030",
    email: "kavya@example.com",
    adm_num: "23234",
    dob: "2003-03-12",
    password: "qwertyy",
}
test("should signup a user", async () => {
    // create a user in test
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

    const user = await User.findOne({where: {username: response.body.user.username}});
    expect(user).not.toBeNull();
    expect(user.password).not.toBe('qwertyy')
    expect(user.tokens.length).toBe(1);
})

test("should not signup with wrong patterns", async () => {
    // expect request to be fail, for same username
    await request(app)
    .post("/users")
    .send({
        name: "kavya",
        username: "kavya2030",
        email: "kavya@example.com",
        adm_num: "23234",
        dob: "2003-03-12",
        password: "qwertyy",
    })
    .expect(400)

    // fail, for wrong username pattern
    await request(app)
    .post("/users")
    .send({
        name: "kavya",
        username: "kavya 2030",
        email: "kavya@example.com",
        adm_num: "23234",
        dob: "2003-03-12",
        password: "qwertyy",
    })
    .expect(400)
})

test("Should log in existing users", async () => {
    const res = await request(app)
        .post("/users/login")
        .send({
            email: user1.email,
            password: user1.password
        })
        .expect(200)

    const user = await User.findOne({where: {username: user1.username}})
    expect(user.tokens.length).toBeGreaterThan(1) 
})

test("should not login non existing user", async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'anomynous',
            password: 'helloString'
        })
        .expect(404)
})

test("Should get the profile of the existing user", async () => {
    const res = await request(app)
        .get('/users/'+user1.username)
        .expect(200)
    
    const user = res.body
    expect(user).not.toHaveProperty('token')
    expect(user).not.toHaveProperty('password')
})

test("Should not get profile of non exiting user", async () => {
    await request(app).get('/users/laplace').expect(404)
})

test("Should have the isFollowing property when authorized", async () => {
    const res = await request(app)
        .get(`/users/${user1.username}/full`)
        .set('Authorization', `Bearer ${tempUser.token}`)
        .expect(200)
    
    const user = res.body
    expect(user).toHaveProperty('isFollowing')
    expect(user).not.toHaveProperty('token')
    expect(user).not.toHaveProperty('password')
})

test("Should return 404 for non existing user", async () => {
    await request(app)
        .get('/users/laplace/full')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .expect(404)
})

test("Should not add follow if user not exists or same username", async () => {
    await request(app)
        .post('/users/follow')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .send({
            username: 'laplace'
        })
        .expect(400)

    await request(app)
        .post('/users/follow')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .send({
            username: tempUser.username
        })
        .expect(400)
})

test("should follow the existing user", async () => {
    const res = await request(app)
        .post('/users/follow')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .send({
            username: user1.username
        })
        .expect(201)

    expect(res.body).toMatchObject({})
})

test("Should unfollow the existing pair", async () => {
    await request(app)
        .delete('/users/follow')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .send({
            username: user1.username
        })
        .expect(200)
})

test ("Should not delete non existing pair or same username", async () => {
    await request(app)
        .delete('/users/follow')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .send({
            username: undefined
        })
        .expect(400)

    await request(app)
        .delete('/users/follow')
        .set('Authorization', `Bearer ${tempUser.token}`)
        .send({
            username: tempUser.username
        })
        .expect(400)
})

test("Should get an array of followers and followings", async () => {
    const res_followers = await request(app)
        .get(`/users/${tempUser.username}/followers`)
        .set('Authorization', `Bearer ${tempUser.token}`)
        .expect(200)

    const res_following = await request(app)
        .get(`/users/${tempUser.username}/following`)
        .set('Authorization', `Bearer ${tempUser.token}`)
        .expect(200)
    
    expect(Array.isArray(res_followers.body)).toBe(true)
    expect(Array.isArray(res_following.body)).toBe(true)
})